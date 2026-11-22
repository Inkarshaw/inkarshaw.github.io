#!/usr/bin/env python3
"""One-off source availability and HTML-structure probe for CDS II 2020 text recovery.
No answers are treated as official, and nothing is scored or published by this probe.
"""
import re
import requests
from bs4 import BeautifulSoup

URLS = {
    "original_upsc": "https://www.upsc.gov.in/sites/default/files/QP-CDS2-20-GENERAL_KNOWLEDGE.pdf",
    "oswaal_pdf_text": "https://www.oswaal360.com/pluginfile.php/10939/mod_folder/content/0/pyp24/cds/cds_yearwise/CDS%202020%20Exam-II%20General%20Knowledge.pdf",
    "mcqquestion_html": "https://mcqquestion.com/cds/cds-ii-2020-general-knowledge-full-question-paper/",
    "pyqvault_html": "https://www.pyqvault.com/mock/cds-2020-ii-gk/paper",
}
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (compatible; ClearExamsSourceAudit/1.0; +https://clearexams.ink)"})
for name,url in URLS.items():
    print("\nSOURCE",name,flush=True)
    try:
        r=session.get(url,timeout=35)
        print("http=",r.status_code,"bytes=",len(r.content),"content_type=",r.headers.get("content-type",""),flush=True)
        if r.status_code!=200:continue
        if "pdf" in name or "upsc" in name:
            print("pdf magic:",r.content[:12],flush=True)
            continue
        soup=BeautifulSoup(r.text,"html.parser")
        for needle in ["As per the Budget Estimates of 2019-20","Which one of the following Indian Ocean island nations"]:
            t=soup.find(string=lambda z: bool(z and needle in str(z)))
            print("needle",needle[:24],"found",t is not None)
            if t:
                par=t.parent
                for level in range(5):
                    if par is None:break
                    print("level",level,"tag",par.name,"class",par.get("class"),"id",par.get("id"),"direct_children",[(x.name,x.get("class")) for x in par.find_all(recursive=False)[:7]],"text",par.get_text(" ",strip=True)[:220],flush=True)
                    par=par.parent
        print("h2/h3 tags",[(x.name,x.get_text(' ',strip=True)[:60],x.get('class')) for x in soup.find_all(['h2','h3'])[:10]],flush=True)
    except Exception as e:
        print("ERROR",type(e).__name__,str(e)[:300],flush=True)
