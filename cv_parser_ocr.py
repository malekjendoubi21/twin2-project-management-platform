#!/usr/bin/env python3
import sys
import os
import re
import json
import tempfile
import logging
from datetime import datetime
from pdf2image import convert_from_path
from pdf2image.exceptions import PDFInfoNotInstalledError
import pytesseract

# Optional PDF fallback
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

# Optional spaCy for NER
try:
    import spacy
    nlp = spacy.load('en_core_web_sm')
    HAS_SPACY = True
except Exception:
    HAS_SPACY = False

# Configure Tesseract
pytesseract.pytesseract.tesseract_cmd = os.getenv(
    'TESSERACT_CMD',
    r'C:\Program Files\Tesseract-OCR\tesseract.exe'
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('cv_parser_ocr')

EMAIL_RE = r'[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}'
PHONE_RE = r'\+\d{1,3}(?:[ \-.\(\)]*\d+){2,}'

SECTION_HEADERS = {
    'header':       [],
    'summary':      ['about me','objective','summary','profile'],
    'skills':       ['skills','technical skills','competencies'],
    'languages':    ['languages','language proficiency'],
    'experience':   ['experience','work experience','professional experience','internship'],
    'education':    ['education','academic background'],
    'references':   ['reference','references'],
    'links':        ['links'],
    'hobbies':      ['hobbies'],
    'certifications': ['certifications', 'certificates', 'accreditations']
}

class CVParser:
    def __init__(self, path):
        self.path = path
        self.text = ""
        self.lines = []
        self.sections = {}
        self.data = {
            'fullName': '', 'email': '', 'phone': '',
            'bio': '', 'skills': [], 'languages': [],
            'experiences': [], 'certifications': []
        }

    def parse(self):
        self._ocr_text()
        if not self.text.strip():
            self._fallback_text()
        self._segment()
        self._extract_name()
        self._extract_contact()
        self._extract_skills()
        self._extract_languages()
        self._extract_experiences()
        self._extract_bio()
        self._extract_certifications()
        
        # Post-process to fix validation issues
        self._fix_validation_issues()
        
        return self.data

    def _ocr_text(self):
        try:
            if self.path.lower().endswith('.pdf'):
                pop = os.getenv('POPPLER_PATH') or os.getenv('pdf')
                imgs = convert_from_path(self.path, dpi=300,
                    poppler_path=pop if pop and os.path.isdir(pop) else None)
                self.text = "\n".join(pytesseract.image_to_string(i) for i in imgs)
                logger.info("OCR extracted text successfully")
            else:
                self.text = pytesseract.image_to_string(self.path)
                logger.info("OCR extracted text successfully")
        except PDFInfoNotInstalledError:
            logger.warning("Poppler not found; OCR may be incomplete")
        except Exception as e:
            logger.warning(f"OCR error: {e}")
        self.lines = [L.strip() for L in self.text.splitlines() if L.strip()]
        logger.info(f"Processed text into {len(self.lines)} lines")

    def _fallback_text(self):
        raw = ""
        if HAS_PYPDF2 and self.path.lower().endswith('.pdf'):
            try:
                r = PyPDF2.PdfReader(self.path)
                raw = "\n".join(p.extract_text() or "" for p in r.pages)
            except:
                raw = ""
        if not raw:
            try:
                raw = open(self.path,'rb').read().decode('utf-8','ignore')
            except:
                raw = ""
        self.text = raw
        self.lines = [L.strip() for L in raw.splitlines() if L.strip()]
        logger.info(f"Used fallback text extraction, found {len(self.lines)} lines")

    def _segment(self):
        cur = 'header'
        self.sections = {cur: []}
        for L in self.lines:
            low = L.lower()
            for sec, heads in SECTION_HEADERS.items():
                if any(low.startswith(h) for h in heads):
                    cur = sec
                    self.sections.setdefault(cur, [])
                    logger.info(f"Detected section: {sec} from line: {L}")
                    break
            self.sections.setdefault(cur, []).append(L)
        logger.info(f"Extracted text length: {len(self.text)}")

    def _extract_name(self):
        # 1) email-based
        m = re.search(EMAIL_RE, self.text)
        if m:
            user = m.group(0).split('@')[0]
            parts = re.split(r'[._]', user)
            name = " ".join(p.title() for p in parts if p)
            if len(name.split())>=2:
                self.data['fullName'] = name
                logger.info(f"Extracted name from email: {name}")
                return

        # 2) spaCy NER
        if HAS_SPACY:
            doc = nlp(self.text[:1000])  # Limit to first 1000 chars for performance
            for ent in doc.ents:
                if ent.label_=='PERSON' and re.fullmatch(r'[A-Za-z ]+', ent.text):
                    cand = ent.text.strip()
                    if len(cand.split())>=2:
                        self.data['fullName'] = cand
                        logger.info(f"Extracted name using NER: {cand}")
                        return

        # 3) Title-case header lines
        for L in self.sections.get('header',[]):
            if re.search(r'linkedin|@|\+|\d', L, re.I): continue
            if re.fullmatch(r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+', L.strip()):
                self.data['fullName'] = L.strip()
                logger.info(f"Extracted name from header: {L.strip()}")
                return

        # 4) scan header lines for >=2 alpha-words
        for L in self.sections.get('header',[]):
            clean = re.sub(r'[^A-Za-z\s]','',L).strip()
            if len(clean.split())>=2:
                self.data['fullName'] = clean.title()
                logger.info(f"Extracted name from header words: {clean.title()}")
                return
                
        logger.info(f"Extracted name: {self.data['fullName']}")

    def _extract_contact(self):
        em = re.search(EMAIL_RE, self.text)
        self.data['email'] = em.group(0) if em else ""
        phones = re.findall(PHONE_RE, self.text)
        phone = ""
        for p in phones:
            if not re.fullmatch(r'\d{4}[-–]\d{4}', p):
                phone = re.sub(r'[^\d+]', '', p)
                break
        self.data['phone'] = phone
        logger.info(f"Extracted email: {self.data['email']} and phone: {self.data['phone']}")

    def _extract_skills(self):
        out=[]
        for L in self.sections.get('skills',[]):
            if any(L.lower().startswith(h) for h in SECTION_HEADERS['skills']): continue
            t = re.sub(r'^[\u2022\-\*\•]\s*','',L).strip()
            if t: out.append(t)
        self.data['skills'] = out
        logger.info(f"Extracted {len(self.data['skills'])} skills: {self.data['skills']}")

    def _extract_languages(self):
        out=[]
        for L in self.sections.get('languages',[]):
            if any(L.lower().startswith(h) for h in SECTION_HEADERS['languages']): continue
            t = re.sub(r'^[\u2022\-\*\•]\s*','',L).strip()
            if t: out.append(t)
        self.data['languages'] = out
        logger.info(f"Extracted {len(self.data['languages'])} languages: {self.data['languages']}")

    def _extract_experiences(self):
        seq = self.sections.get('experience',[])
        exp=[]
        # block by date-containing or header lines
        i=0
        date_re = re.compile(r'(\d{4}|\w+\s*\d{4})\s*[-–]\s*(Present|\d{4})')
        while i < len(seq):
            L = seq[i]
            # if line contains a date, treat as header+date on same line
            dm = date_re.search(L)
            if dm:
                start, end = dm.group(1), dm.group(2)
                header_part = L[:dm.start()].strip()
                # Parse title and company from header part
                title = header_part
                comp = ""
                
                # Try to extract company from title 
                if '-' in header_part:
                    parts = header_part.split('-', 1)
                    title = parts[0].strip()
                    comp = parts[1].strip()
                
                # Default company if empty
                if not comp:
                    comp = "Company Not Specified"
                
                # collect bullets
                j=i+1
                desc=[]
                while j<len(seq) and seq[j].startswith(('•','-','*')):
                    desc.append(seq[j].lstrip('•-* ').strip())
                    j+=1
                
                # Default description if empty
                description = ' '.join(desc)
                if not description:
                    description = f"Work experience as {title} at {comp}."
                
                # Format end date properly for MongoDB
                end_date = datetime.now().strftime("%Y-%m-%d") if end=='Present' else f"{end[-4:]}-12-31"
                
                exp.append({
                    'title': title,
                    'company': comp, 
                    'startDate': f"{start[-4:]}-01-01",
                    'endDate': end_date,
                    'description': description
                })
                i=j
                continue
            # else if next line has a date
            if i+1<len(seq):
                dm2 = date_re.search(seq[i+1])
                if dm2:
                    title = L
                    start,end = dm2.group(1), dm2.group(2)
                    comp = "Company Not Specified"
                    
                    # Try to extract company from title
                    if '-' in title:
                        parts = title.split('-', 1)
                        title = parts[0].strip()
                        comp = parts[1].strip()
                    
                    # collect bullets after line+1
                    j=i+2; desc=[]
                    while j<len(seq) and seq[j].startswith(('•','-','*')):
                        desc.append(seq[j].lstrip('•-* ').strip())
                        j+=1
                    
                    # Default description if empty
                    description = ' '.join(desc)
                    if not description:
                        description = f"Work experience as {title} at {comp}."
                    
                    # Format end date properly for MongoDB
                    end_date = datetime.now().strftime("%Y-%m-%d") if end=='Present' else f"{end[-4:]}-12-31"
                    
                    exp.append({
                        'title': title,
                        'company': comp,
                        'startDate': f"{start[-4:]}-01-01",
                        'endDate': end_date,
                        'description': description
                    })
                    i=j
                    continue
            i+=1
        self.data['experiences'] = exp
        logger.info(f"Extracted {len(exp)} experiences")

    def _extract_bio(self):
        lines = self.sections.get('summary',[])
        bio = []
        for L in lines:
            if any(L.lower().startswith(h) for h in SECTION_HEADERS['summary']): continue
            bio.append(L)
        self.data['bio'] = ' '.join(bio).strip()
        logger.info(f"Extracted bio: {self.data['bio'][:50]}...")
        
    def _extract_certifications(self):
        """Extract certifications from CV"""
        certifications = []
        
        if "certifications" in self.sections:
            cert_lines = self.sections["certifications"]
            for line in cert_lines:
                if any(line.lower().startswith(h) for h in SECTION_HEADERS['certifications']):
                    continue
                    
                if len(line.strip()) < 3:
                    continue
                
                # Try to separate certification name from issuer
                parts = line.split(' - ')
                if len(parts) > 1:
                    cert_name = parts[0].strip()
                    issuer = parts[1].strip()
                else:
                    cert_name = line.strip()
                    issuer = "Certification Authority"
                
                # Look for dates
                date_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}', line)
                cert_date = date_match.group(0) if date_match else ""
                
                certifications.append({
                    "name": cert_name,
                    "issuer": issuer,
                    "issued_by": issuer,  # Add required field for MongoDB
                    "date": cert_date
                })
                
                logger.info(f"Extracted certification: {cert_name}")
        
        self.data['certifications'] = certifications
        logger.info(f"Extracted {len(certifications)} certifications")
    
    def _fix_validation_issues(self):
        """Fix common validation issues to ensure MongoDB compatibility"""
        
        # Fix experiences
        for exp in self.data['experiences']:
            # Fix empty company fields
            if not exp['company'] or exp['company'].strip() == '':
                if '-' in exp['title']:
                    title_parts = exp['title'].split('-', 1)
                    exp['title'] = title_parts[0].strip()
                    exp['company'] = title_parts[1].strip()
                else:
                    exp['company'] = "Company Not Specified"
            
            # Fix empty description fields
            if not exp['description'] or exp['description'].strip() == '':
                exp['description'] = f"Work experience as {exp['title']} at {exp['company']}."
            
            # Convert "Present" to actual date
            if exp['endDate'] == 'Present':
                exp['endDate'] = datetime.now().strftime("%Y-%m-%d")
                
        # Fix certification fields  
        for cert in self.data['certifications']:
            if 'issued_by' not in cert or not cert['issued_by']:
                cert['issued_by'] = cert.get('issuer', "Certification Authority")
        
        logger.info("Fixed validation issues in extracted data")


if __name__=='__main__':
    if len(sys.argv) < 2:
        print("Usage: python cv_parser.py <file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    file_type = sys.argv[2] if len(sys.argv) > 2 else None
    user_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    logger.info(f"Starting CV parsing for file: {file_path}")
    parser = CVParser(file_path)
    print(json.dumps(parser.parse(), indent=2))