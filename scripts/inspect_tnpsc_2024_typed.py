#!/usr/bin/env python3
"""Inspect an independently typed 2024 Group IV index as an editorial cross-check.

The authoritative source remains the official scanned TNPSC paper and final key.
"""
import re
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup
url="https://www.tnpscguide.com/exams/group-4/papers/group-4-2024-question-paper"
req=Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; ClearExams/1.0; educational source QA)"})
with urlopen(req,timeout=30) as response: body=response.read()
print("HTML_BYTES",len(body))
soup=BeautifulSoup(body,"html.parser")
for tag in soup.find_all(["h2","h3","h4","strong"]):
    s=tag.get_text(" ",strip=True)
    if re.fullmatch(r"Question\\s+\\d+",s,re.I):
        print("QUESTION_HEADING",tag.name,repr(s))
        p=tag
        for i in range(4):
            print("PARENT",i,p.name,repr(p.get("class")),"HTML",str(p)[:1600])
            if p.parent:p=p.parent
        break
else:
    print("No matching question heading",[(t.name,t.get_text(" ",strip=True)[:80]) for t in soup.find_all(["h2","h3","h4"])[:20]])
