import json, random, os
from collections import defaultdict, Counter

OUT="data/textbook/class-11/history/unit-19.json"
random.seed(1902026)

RAW=r"""
298|period|Period by which a small English-educated intelligentsia had emerged in India|First quarter of the nineteenth century|இந்தியாவில் சிறிய ஆங்கிலக் கல்வி பெற்ற அறிவுஜீவி வர்க்கம் தோன்றிய காலம்|19ஆம் நூற்றாண்டின் முதல் கால்பகுதி
298|region|First province deeply affected by British influence and source of many reform ideas|Bengal|ஆங்கிலேய செல்வாக்கால் முதலில் பாதிக்கப்பட்டு பல சீர்திருத்தக் கருத்துகள் தோன்றிய மாகாணம்|வங்காளம்
298|factor|One force bringing new thoughts that challenged traditional knowledge|British administration|மரபு அறிவுக்கு சவால் விடுத்த புதிய சிந்தனைகளை கொண்டு வந்த ஒரு காரணி|ஆங்கிலேய நிர்வாகம்
298|factor|One force bringing new thoughts to India|English education|இந்தியாவிற்கு புதிய சிந்தனைகளை கொண்டு வந்த ஒரு காரணி|ஆங்கிலக் கல்வி
298|factor|One force bringing new thoughts to India|European literature|இந்தியாவிற்கு புதிய சிந்தனைகளை கொண்டு வந்த ஒரு காரணி|ஐரோப்பிய இலக்கியம்
298|idea|Ethical basis associated with Indian Renaissance|Rationalism|இந்திய மறுமலர்ச்சியுடன் தொடர்புடைய நெறிச் சிந்தனை அடிப்படை|பகுத்தறிவு
298|idea|One modern idea contributing to Indian Renaissance|Human progress and evolution|இந்திய மறுமலர்ச்சிக்கு வித்திட்ட நவீன சிந்தனை|மனித முன்னேற்றமும் பரிணாமமும்
298|idea|Enlightenment concept contributing to Indian Renaissance|Natural rights|இந்திய மறுமலர்ச்சிக்கு வித்திட்ட அறிவொளி கருத்து|இயற்கை உரிமைகள்
298|technology|Technology crucial for diffusion of reform ideas|Printing technology|சீர்திருத்தக் கருத்துகள் பரவ முக்கிய பங்கு வகித்த தொழில்நுட்பம்|அச்சுத் தொழில்நுட்பம்
298|term|British description of Indian society as trapped in superstition and obscurantism|Vicious circle|மூடநம்பிக்கை மற்றும் இருள் மனப்பான்மையில் இந்திய சமூகம் சிக்கியதாக ஆங்கிலேயர் கூறிய சொல்|தொடர் சிக்கல்
298|practice|Religious practice particularly condemned in British critique|Sati|ஆங்கிலேய விமர்சனத்தில் குறிப்பாக கண்டிக்கப்பட்ட சமய நடைமுறை|சதி
298|system|Social division based on birth criticised in reform discourse|Caste system|பிறப்பின் அடிப்படையிலான சமூகப் பிரிவு|சாதி முறை
298|group|Groups whose self-serving argument justified British rule|Missionaries and Utilitarians|ஆங்கில ஆட்சியை நியாயப்படுத்தும் வாதம் முன்வைத்த குழுக்கள்|கிறித்தவ மறைப்பணியாளர்களும் யூடிலிட்டேரியன்களும்
298|meaning|Meaning of Utilitarians in the lesson|Believers in greatest happiness of the greatest number|பாடநூலில் யூடிலிட்டேரியன்கள் என்பதன் பொருள்|அதிகமானோரின் அதிகமான மகிழ்ச்சியை நம்புவோர்
299|period|Period when protest and desire for change were articulated through reform movements|Second half of the nineteenth century|சீர்திருத்த இயக்கங்களின் மூலம் மாற்ற விருப்பம் வெளிப்பட்ட காலம்|19ஆம் நூற்றாண்டின் இரண்டாம் பாதி
299|aim|Broad aim of nineteenth-century reform movements|Reform and democratize social institutions and religious outlook|19ஆம் நூற்றாண்டு சீர்திருத்த இயக்கங்களின் பரந்த நோக்கம்|சமூக நிறுவனங்களையும் சமயக் கண்ணோட்டத்தையும் சீர்திருத்தி ஜனநாயகப்படுத்துதல்
299|factor|One force strengthening resolve for reform|New economic forces|சீர்திருத்தத் தீர்மானத்தை வலுப்படுத்திய காரணி|புதிய பொருளாதார சக்திகள்
299|factor|One force strengthening resolve for reform|Spread of education|சீர்திருத்தத் தீர்மானத்தை வலுப்படுத்திய காரணி|கல்வி பரவல்
299|factor|One force strengthening resolve for reform|Growth of nationalist sentiment|சீர்திருத்தத் தீர்மானத்தை வலுப்படுத்திய காரணி|தேசிய உணர்வு வளர்ச்சி
299|factor|One force strengthening resolve for reform|Modern Western thought and culture|சீர்திருத்தத் தீர்மானத்தை வலுப்படுத்திய காரணி|நவீன மேலைச் சிந்தனையும் பண்பாடும்
299|principle|One idea giving ideological unity to reform movements|Rationalism|சீர்திருத்த இயக்கங்களுக்கு கருத்தியல் ஒற்றுமை அளித்த கொள்கை|பகுத்தறிவு
299|principle|One idea giving ideological unity to reform movements|Religious universalism|சீர்திருத்த இயக்கங்களுக்கு கருத்தியல் ஒற்றுமை அளித்த கொள்கை|சமய உலகளாவியத்தன்மை
299|principle|One idea giving ideological unity to reform movements|Humanism|சீர்திருத்த இயக்கங்களுக்கு கருத்தியல் ஒற்றுமை அளித்த கொள்கை|மனிதநேயம்
299|person|Reformer said to have repudiated the infallibility of the Vedas|Raja Rammohan Roy|வேதங்கள் தவறாதவை என்ற கருத்தை மறுத்ததாக பாடநூல் கூறும் சீர்திருத்தவாதி|ராஜா ராம்மோகன் ராய்
299|person|Reformer who emphasized that religious tenets were not immutable|Syed Ahmad Khan|சமயக் கோட்பாடுகள் மாற்றமற்றவை அல்ல என்று வலியுறுத்தியவர்|சையது அகமது கான்
299|person|Reformer quoted on all established religions being true|Keshab Chandra Sen|உலகின் நிறுவப்பட்ட சமயங்கள் அனைத்தும் உண்மையானவை எனக் கூறியவர்|கேசப் சந்திர சென்
299|category|One broad category of reform movements|Reformist movements|சீர்திருத்த இயக்கங்களின் ஒரு பெரிய வகை|சீர்திருத்த இயக்கங்கள்
299|category|Another broad category of reform movements|Revivalist movements|சீர்திருத்த இயக்கங்களின் மற்றொரு பெரிய வகை|மீட்டெடுப்பு இயக்கங்கள்
299|difference|Primary difference between reformist and revivalist movements|Degree of reliance on tradition versus reason and conscience|சீர்திருத்த மற்றும் மீட்டெடுப்பு இயக்கங்களின் முக்கிய வேறுபாடு|மரபு மற்றும் பகுத்தறிவு/மனச்சாட்சி மீது வைத்த நம்பிக்கையின் அளவு
299|inequality|One social evil drawing legitimacy from religion|Caste-based inequality|சமயத்திலிருந்து நியாயப்படுத்தல் பெற்ற ஒரு சமூகத் தீமை|சாதி அடிப்படையிலான சமத்துவமின்மை
299|inequality|One social evil drawing legitimacy from religion|Gender-based inequality|சமயத்திலிருந்து நியாயப்படுத்தல் பெற்ற ஒரு சமூகத் தீமை|பாலின சமத்துவமின்மை
299|base|Initial social base of reform movements|Upper and middle strata|சீர்திருத்த இயக்கங்களின் ஆரம்ப சமூக ஆதாரம்|மேல்தட்டு மற்றும் நடுத்தர வர்க்கங்கள்
299|medium|One medium through which intellectual debates spread new ideas|Public arguments|புதிய கருத்துகளை பரப்பிய அறிவுஜீவி விவாத வடிவம்|பொது விவாதங்கள்
299|medium|One medium through which reform ideas spread|Tracts|சீர்திருத்தக் கருத்துகள் பரவிய ஒரு ஊடகம்|துண்டுப் பிரசுரங்கள்
299|medium|One medium through which reform ideas spread|Journals|சீர்திருத்தக் கருத்துகள் பரவிய ஒரு ஊடகம்|இதழ்கள்
299|organization|One early organization giving impetus to social reform|Social Conference|சமூக சீர்திருத்தத்திற்கு ஊக்கமளித்த ஆரம்ப அமைப்பு|சோஷியல் கான்பரன்ஸ்
299|organization|One early organization giving impetus to social reform|Servants of India|சமூக சீர்திருத்தத்திற்கு ஊக்கமளித்த ஆரம்ப அமைப்பு|சர்வன்ட்ஸ் ஆஃப் இந்தியா
299|force|Movement providing leadership to social reform by twentieth century|National movement|20ஆம் நூற்றாண்டில் சமூக சீர்திருத்தத்திற்கு தலைமை வழங்கிய இயக்கம்|தேசிய இயக்கம்

299|movement|Movement founded by Raja Rammohan Roy in August 1828|Brahmo Samaj|ராஜா ராம்மோகன் ராய் ஆகஸ்ட் 1828இல் தொடங்கிய இயக்கம்|பிரம்ம சமாஜம்
299|date|Month and year Brahmo Samaj was established|August 1828|பிரம்ம சமாஜம் தொடங்கப்பட்ட மாதம் மற்றும் ஆண்டு|ஆகஸ்ட் 1828
299|person|Founder of Brahmo Samaj|Raja Rammohan Roy|பிரம்ம சமாஜத்தை நிறுவியவர்|ராஜா ராம்மோகன் ராய்
299|title|Title given to Raja Rammohan Roy in the lesson|Father of Indian Renaissance|ராஜா ராம்மோகன் ராய்க்கு பாடநூல் வழங்கும் பட்டம்|இந்திய மறுமலர்ச்சியின் தந்தை
299|aim|Long-term religious aim of Rammohan Roy|Purify Hinduism and preach monotheism|ராம்மோகன் ராயின் நீண்டகால சமய நோக்கம்|இந்துமதத்தை தூய்மைப்படுத்தி ஒரே கடவுள் கொள்கையை போதித்தல்
299|source|Textual authority used by Rammohan Roy for monotheism|Vedas|ஒரே கடவுள் கொள்கைக்கு ராம்மோகன் ராய் ஆதாரமாக எடுத்த நூல்கள்|வேதங்கள்
299|value|Human principle emphasized by Rammohan Roy|Human dignity|ராம்மோகன் ராய் வலியுறுத்திய மனித மதிப்பு|மனித கண்ணியம்
299|practice|Religious practice opposed by Rammohan Roy|Idolatry|ராம்மோகன் ராய் எதிர்த்த சமய நடைமுறை|உருவ வழிபாடு
299|evil|Social evil strongly opposed by Rammohan Roy|Sati|ராம்மோகன் ராய் தீவிரமாக எதிர்த்த சமூகத் தீமை|சதி
299|employment|Rammohan Roy's former employment|Servant of the East India Company|ராம்மோகன் ராயின் முன்னாள் பணி|கிழக்கிந்தியக் கம்பெனி ஊழியர்
299|language|One language known by Rammohan Roy|Persian|ராம்மோகன் ராய் அறிந்த மொழிகளில் ஒன்று|பாரசீகம்
299|language|One language known by Rammohan Roy|Sanskrit|ராம்மோகன் ராய் அறிந்த மொழிகளில் ஒன்று|சமஸ்கிருதம்
299|tract|Rammohan Roy's 1818 tract against sati|A Conference Between an Advocate for and an Opponent of the Practice of Burning Widows|சதிக்கு எதிராக 1818இல் ராம்மோகன் ராய் எழுதிய நூல்|A Conference Between an Advocate for and an Opponent of the Practice of Burning Widows
299|date|Year of Rammohan Roy's tract on sati|1818|ராம்மோகன் ராய் சதி எதிர்ப்பு நூல் வெளியான ஆண்டு|1818
300|date|Year Company law declared sati a crime|1829|சதியை குற்றமாக அறிவித்த கம்பெனி சட்ட ஆண்டு|1829
300|doctrine|Brahmo Samaj position on polytheism|Denounced it|பல கடவுள் கொள்கை குறித்து பிரம்ம சமாஜத்தின் நிலை|கண்டித்தது
300|doctrine|Brahmo Samaj position on idol worship|Denounced it|உருவ வழிபாடு குறித்து பிரம்ம சமாஜத்தின் நிலை|கண்டித்தது
300|doctrine|Brahmo Samaj position on divine avatars|Denounced belief in avatars|அவதார நம்பிக்கை குறித்து பிரம்ம சமாஜத்தின் நிலை|கண்டித்தது
300|social|Brahmo Samaj position on caste system|Condemned it|சாதி முறை குறித்து பிரம்ம சமாஜத்தின் நிலை|கண்டித்தது
300|social|Brahmo Samaj position on child marriage|Wanted abolition|குழந்தைத் திருமணம் குறித்து பிரம்ம சமாஜத்தின் நிலை|ஒழிக்க விரும்பியது
300|social|Brahmo Samaj position on purdah|Wanted abolition|பர்தா முறை குறித்து பிரம்ம சமாஜத்தின் நிலை|ஒழிக்க விரும்பியது
300|social|Brahmo Samaj position on widow remarriage|Supported it|விதவை மறுமணம் குறித்து பிரம்ம சமாஜத்தின் நிலை|ஆதரித்தது
300|inspiration|Political event whose ideals inspired Rammohan Roy|French Revolution|ராம்மோகன் ராயைத் தூண்டிய அரசியல் நிகழ்வு|பிரெஞ்சுப் புரட்சி
300|place|European city where Rammohan Roy died|Bristol|ராம்மோகன் ராய் இறந்த ஐரோப்பிய நகரம்|பிரிஸ்டல்
300|person|Leader who gave Brahmo Samaj new life after Rammohan Roy|Devendranath Tagore|ராம்மோகன் ராய்க்குப் பின் பிரம்ம சமாஜத்திற்கு புதிய உயிர் கொடுத்தவர்|தேவேந்திரநாத் தாகூர்
300|relation|Devendranath Tagore's relation to Rabindranath Tagore|Father|தேவேந்திரநாத் தாகூருக்கும் ரவீந்திரநாத் தாகூருக்கும் உறவு|தந்தை
300|person|Leader who took Brahmo Samaj forward from 1857|Keshab Chandra Sen|1857 முதல் பிரம்ம சமாஜத்தை முன்னெடுத்தவர்|கேசப் சந்திர சென்
300|date|Year Keshab Chandra Sen took organization forward|1857|கேசப் சந்திர சென் பிரம்ம சமாஜத்தை முன்னெடுத்த ஆண்டு|1857
300|number|Total Brahmo Samajas in 1865|54|1865இல் இருந்த பிரம்ம சமாஜங்களின் மொத்த எண்ணிக்கை|54
300|number|Brahmo Samajas in Bengal in 1865|50|1865இல் வங்காளத்தில் இருந்த பிரம்ம சமாஜங்கள்|50
300|number|Brahmo Samajas in North West Province in 1865|2|1865இல் வடமேற்கு மாகாணத்தில் இருந்த பிரம்ம சமாஜங்கள்|2
300|number|Brahmo Samajas in Punjab in 1865|1|1865இல் பஞ்சாபில் இருந்த பிரம்ம சமாஜம்|1
300|number|Brahmo Samajas in Madras in 1865|1|1865இல் மதராசில் இருந்த பிரம்ம சமாஜம்|1
300|branch|Textbook name for Devendranath Tagore's branch after split|Brahmo Samaj of India|பிரிவுக்குப் பின் தேவேந்திரநாத் தாகூரின் கிளை என பாடநூல் கூறும் பெயர்|Brahmo Samaj of India
300|branch|Textbook name for Keshab Chandra Sen's branch after split|Sadharan Brahmo Samaj|பிரிவுக்குப் பின் கேசப் சந்திர சென் கிளை என பாடநூல் கூறும் பெயர்|Sadharan Brahmo Samaj
300|person|Tamil Nadu adherent of Brahmo Samaj|Kasi Viswanatha Mudaliar|தமிழ்நாட்டில் பிரம்ம சமாஜத்தைச் சார்ந்தவர்|காசி விஸ்வநாத முதலியார்
300|work|Play written by Kasi Viswanatha Mudaliar|Brahmo Samaja Natakam|காசி விஸ்வநாத முதலியார் எழுதிய நாடகம்|பிரம்ம சமாஜ நாடகம்
300|journal|Tamil journal started for Brahmo Samaj cause|Tathuva Bodhini|பிரம்ம சமாஜ நோக்கத்திற்காக தொடங்கப்பட்ட தமிழ் இதழ்|தத்துவ போதினி
300|date|Year Tathuva Bodhini was started|1864|தத்துவ போதினி தொடங்கப்பட்ட ஆண்டு|1864
300|opposition|Orthodox Bengal organization opposing Brahmo Samaj|Hindu Dharma Sabha|பிரம்ம சமாஜத்தை எதிர்த்த வங்காள வைதீக அமைப்பு|இந்து தர்ம சபை
300|person|Reformer supporting similar ideas through Hindu scriptures|Ishwarchandra Vidyasagar|இந்து சாஸ்திர ஆதாரத்துடன் ஒத்த கருத்துகளை ஆதரித்த சீர்திருத்தவாதி|ஈஸ்வர சந்திர வித்யாசாகர்
300|family|Famous literary family influenced by Brahmo Samaj|Tagore family|பிரம்ம சமாஜத்தால் செல்வாக்கு பெற்ற புகழ்பெற்ற குடும்பம்|தாகூர் குடும்பம்

300|movement|Offshoot of Brahmo Samaj founded in Bombay in 1867|Prarthana Samaj|1867இல் பம்பாயில் தொடங்கிய பிரம்ம சமாஜ கிளை இயக்கம்|பிரார்த்தனை சமாஜம்
300|person|Founder of Prarthana Samaj|Atmaram Pandurang|பிரார்த்தனை சமாஜத்தை நிறுவியவர்|ஆத்மாராம் பாண்டுரங்க்
300|date|Year Prarthana Samaj was founded|1867|பிரார்த்தனை சமாஜம் தொடங்கப்பட்ட ஆண்டு|1867
300|place|City where Prarthana Samaj was founded|Bombay|பிரார்த்தனை சமாஜம் தொடங்கப்பட்ட நகரம்|பம்பாய்
300|person|Leading Prarthana Samaj member and social reformer|M.G. Ranade|பிரார்த்தனை சமாஜத்தின் முக்கிய சீர்திருத்தவாதி|எம்.ஜி. ரானடே
300|person|Leading member of Prarthana Samaj|R.G. Bhandarkar|பிரார்த்தனை சமாஜத்தின் முக்கிய உறுப்பினர்|ஆர்.ஜி. பண்டார்கர்
300|person|Leading member of Prarthana Samaj|K.T. Telang|பிரார்த்தனை சமாஜத்தின் முக்கிய உறுப்பினர்|கே.டி. தெலாங்
300|tradition|Religious tradition consciously linked to Prarthana Samaj|Maharashtrian bhakti tradition|பிரார்த்தனை சமாஜம் உணர்வுபூர்வமாக இணைந்த சமய மரபு|மகாராஷ்டிர பக்தி மரபு
300|reform|One social reform emphasized by Prarthana Samaj|Inter-dining|பிரார்த்தனை சமாஜம் வலியுறுத்திய சமூக சீர்திருத்தம்|சமபந்தி உணவு
300|reform|One social reform emphasized by Prarthana Samaj|Inter-marriage|பிரார்த்தனை சமாஜம் வலியுறுத்திய சமூக சீர்திருத்தம்|சாதி கடந்து திருமணம்
300|reform|One social reform emphasized by Prarthana Samaj|Widow remarriage|பிரார்த்தனை சமாஜம் வலியுறுத்திய சமூக சீர்திருத்தம்|விதவை மறுமணம்
300|reform|One social reform emphasized by Prarthana Samaj|Uplift of women and depressed classes|பிரார்த்தனை சமாஜம் வலியுறுத்திய சமூக சீர்திருத்தம்|பெண்கள் மற்றும் ஒடுக்கப்பட்டோரின் முன்னேற்றம்
300|conference|Conference organized at initiative of M.G. Ranade|National Social Conference|எம்.ஜி. ரானடே முயற்சியில் தொடங்கிய மாநாடு|தேசிய சமூக மாநாடு
300|timing|When National Social Conference met each year|Immediately after Indian National Congress annual sessions|தேசிய சமூக மாநாடு ஆண்டுதோறும் எப்போது கூடியது|இந்திய தேசிய காங்கிரஸ் ஆண்டு மாநாட்டுக்குப் பின்
300|date|Year Indian National Congress annual sessions referenced|1885|இந்திய தேசிய காங்கிரஸ் ஆண்டு அமர்வுகளுடன் குறிப்பிடப்பட்ட ஆண்டு|1885
300|association|Association Ranade helped found|Widow Marriage Association|ரானடே நிறுவ உதவிய அமைப்பு|விதவைத் திருமணச் சங்கம்
300|society|Educational society ardently promoted by Ranade|Deccan Education Society|ரானடே தீவிரமாக ஆதரித்த கல்வி அமைப்பு|தக்காண கல்விச் சங்கம்
300|aim|Aim of Deccan Education Society stated in lesson|Educate youth for unselfish service of the country|தக்காண கல்விச் சங்கத்தின் நோக்கம்|நாட்டிற்கு தன்னலமற்ற சேவைக்கு இளைஞரை தயாரித்தல்
300|date|Year M.G. Ranade died|1901|எம்.ஜி. ரானடே இறந்த ஆண்டு|1901
300|person|Leader who succeeded Ranade|Chandavarkar|ரானடேக்கு பின் தலைமை ஏற்றவர்|சந்தவர்க்கர்

300|movement|Movement founded by Dayananda Saraswati in 1875|Arya Samaj|1875இல் தயானந்த சரஸ்வதி தொடங்கிய இயக்கம்|ஆரிய சமாஜம்
300|person|Founder of Arya Samaj|Dayananda Saraswati|ஆரிய சமாஜத்தை நிறுவியவர்|தயானந்த சரஸ்வதி
300|period|Life span of Dayananda Saraswati|1824–1883|தயானந்த சரஸ்வதியின் வாழ்நாள்|1824–1883
300|origin|Regional background of Dayananda Saraswati|Gujarati|தயானந்த சரஸ்வதியின் பிராந்தியப் பின்னணி|குஜராத்தி
300|duration|Years Dayananda wandered around India|Seventeen years|தயானந்தர் இந்தியா முழுவதும் அலைந்த காலம்|17 ஆண்டுகள்
300|date|Year Dayananda became a wandering preacher|1863|தயானந்தர் அலைந்து போதித்தவராக ஆன ஆண்டு|1863
300|date|Year Dayananda met Brahmos in Calcutta|1872|தயானந்தர் கல்கத்தாவில் பிரம்ம சமாஜத்தினரை சந்தித்த ஆண்டு|1872
300|book|Major work of Dayananda Saraswati|Satyarth Prakash|தயானந்த சரஸ்வதியின் முக்கிய நூல்|சத்யார்த்த பிரகாஷ்
300|date|Year Dayananda founded Arya Samaj and published Satyarth Prakash|1875|தயானந்தர் ஆரிய சமாஜத்தை நிறுவி சத்யார்த்த பிரகாஷ் வெளியிட்ட ஆண்டு|1875
301|doctrine|Textual corpus rejected by Dayananda|Puranas|தயானந்தர் நிராகரித்த நூல் மரபு|புராணங்கள்
301|practice|One practice rejected by Dayananda|Polytheism|தயானந்தர் நிராகரித்த நடைமுறை|பல கடவுள் வழிபாடு
301|practice|One practice rejected by Dayananda|Idolatry|தயானந்தர் நிராகரித்த நடைமுறை|உருவ வழிபாடு
301|practice|One institution rejected by Dayananda|Role of Brahmin priests|தயானந்தர் நிராகரித்த ஒரு நிறுவனம்|பிராமண பூசாரிகளின் பங்கு
301|practice|One practice rejected by Dayananda|Pilgrimages|தயானந்தர் நிராகரித்த நடைமுறை|யாத்திரைகள்
301|practice|One restriction rejected by Dayananda|Prohibition on widow marriage|தயானந்தர் நிராகரித்த தடை|விதவை மறுமணத் தடை
301|motto|Call made by Dayananda Saraswati|Back to the Vedas|தயானந்த சரஸ்வதி விடுத்த கோஷம்|வேதங்களுக்குத் திரும்பு
301|reform|One reform encouraged by Dayananda|Female education|தயானந்தர் ஊக்குவித்த சீர்திருத்தம்|பெண் கல்வி
301|reform|One reform encouraged by Dayananda|Widow remarriage|தயானந்தர் ஊக்குவித்த சீர்திருத்தம்|விதவை மறுமணம்
301|region|Main sphere of Dayananda's influence|Punjab|தயானந்தரின் முக்கிய செல்வாக்குப் பகுதி|பஞ்சாப்
301|community|Trading community noted in Punjab context|Khatris|பஞ்சாப் சூழலில் குறிப்பிடப்பட்ட வணிகச் சமூகம்|கத்ரிகள்
301|movement|Dayananda's purification movement|Shuddi movement|தயானந்தரின் தூய்மைப்படுத்தும் இயக்கம்|சுத்தி இயக்கம்
301|meaning|Meaning of Shuddi in the lesson|Conversion of non-Hindus to Hindus|பாடநூலில் சுத்தி இயக்கம் என்பதன் பொருள்|இந்துவல்லாதவர்களை இந்துக்களாக மாற்றுதல்
301|rival|Movement with which Shuddi provoked controversy|Ahmadiya movement|சுத்தி இயக்கத்துடன் சர்ச்சை ஏற்பட்ட இயக்கம்|அகமதியா இயக்கம்
301|classification|How Arya Samaj is classified|Revivalist movement|ஆரிய சமாஜம் எவ்வாறு வகைப்படுத்தப்படுகிறது|மீட்டெடுப்பு இயக்கம்
301|institution|Institutions carrying Dayananda's influence into twentieth century|DAV schools and colleges|தயானந்தரின் செல்வாக்கை 20ஆம் நூற்றாண்டிற்கு எடுத்துச் சென்ற நிறுவனங்கள்|DAV பள்ளிகளும் கல்லூரிகளும்

301|movement|Institution established by Swami Vivekananda|Ramakrishna Mission|சுவாமி விவேகானந்தர் நிறுவிய நிறுவனம்|இராமகிருஷ்ண மிஷன்
301|date|Year Ramakrishna Mission was established|1897|இராமகிருஷ்ண மிஷன் நிறுவப்பட்ட ஆண்டு|1897
301|person|Spiritual teacher associated with Dakshineswar|Ramakrishna Paramahamsa|தட்சிணேஸ்வருடன் தொடர்புடைய ஆன்மிக குரு|இராமகிருஷ்ண பரமஹம்சர்
301|period|Life span of Ramakrishna Paramahamsa|1836–1886|இராமகிருஷ்ண பரமஹம்சரின் வாழ்நாள்|1836–1886
301|place|Temple location associated with Ramakrishna|Dakshineswar near Kolkata|இராமகிருஷ்ணருடன் தொடர்புடைய கோவில் அமைந்த இடம்|கல்கத்தா அருகிலுள்ள தட்சிணேஸ்வர்
301|education|Formal educational status of Ramakrishna|No formal education|இராமகிருஷ்ணரின் முறையான கல்வி நிலை|முறையான கல்வி இல்லை
301|belief|Ramakrishna's core religious belief|Inherent truth of all religions|இராமகிருஷ்ணரின் முக்கிய சமய நம்பிக்கை|அனைத்து சமயங்களிலும் உள்ளார்ந்த உண்மை உள்ளது
301|teaching|Ramakrishna's teaching on religions|Different ways lead to same goal|சமயங்கள் குறித்து இராமகிருஷ்ணரின் போதனை|வேறு வழிகள் ஒரே இலக்கை அடைகின்றன
301|work|Compilation of Ramakrishna's parables|Ramakrishna Kathamrita|இராமகிருஷ்ணரின் உவமைகள் தொகுக்கப்பட்ட நூல்|இராமகிருஷ்ண கதாமிர்தம்
301|alternate|English title of Ramakrishna Kathamrita|The Gospel of Sri Ramakrishna|இராமகிருஷ்ண கதாமிர்தத்தின் ஆங்கிலப் பெயர்|The Gospel of Sri Ramakrishna
301|person|Birth name of Swami Vivekananda|Narendranath Dutta|சுவாமி விவேகானந்தரின் இயற்பெயர்|நரேந்திரநாத் தத்தா
301|period|Life span of Swami Vivekananda|1863–1902|சுவாமி விவேகானந்தரின் வாழ்நாள்|1863–1902
301|university|University from which Narendranath Dutta graduated|Calcutta University|நரேந்திரநாத் தத்தா பட்டம் பெற்ற பல்கலைக்கழகம்|கல்கத்தா பல்கலைக்கழகம்
301|emphasis|Vivekananda's emphasis|Practical work over philosophizing|விவேகானந்தர் வலியுறுத்தியது|தத்துவ உரையை விட நடைமுறைப் பணி
301|event|World religious gathering attended by Vivekananda|Parliament of Religions|விவேகானந்தர் கலந்து கொண்ட உலக சமய மாநாடு|சமயங்களின் பாராளுமன்றம்
301|place|City of Parliament of Religions attended by Vivekananda|Chicago|விவேகானந்தர் கலந்து கொண்ட சமய பாராளுமன்றம் நடந்த நகரம்|சிகாகோ
301|date|Year Vivekananda attended Parliament of Religions|1893|விவேகானந்தர் சமய பாராளுமன்றத்தில் கலந்து கொண்ட ஆண்டு|1893
301|service|One service opened by Ramakrishna Mission|Schools|இராமகிருஷ்ண மிஷன் தொடங்கிய ஒரு சேவை|பள்ளிகள்
301|service|One service opened by Ramakrishna Mission|Dispensaries|இராமகிருஷ்ண மிஷன் தொடங்கிய ஒரு சேவை|மருந்தகங்கள்
301|service|One service opened by Ramakrishna Mission|Orphanages|இராமகிருஷ்ண மிஷன் தொடங்கிய ஒரு சேவை|அனாதை இல்லங்கள்
301|person|Writer who praised Vivekananda's international recognition|Valentine Chirol|விவேகானந்தரின் உலக அங்கீகாரத்தைப் புகழ்ந்தவர்|வாலன்டைன் சிரோல்

302|movement|Society founded by H.P. Blavatsky and H.S. Olcott|Theosophical Society|எச்.பி. பிளாவட்ஸ்கி மற்றும் எச்.எஸ். ஒல்காட் நிறுவிய அமைப்பு|தியோசபிக்கல் சொசைட்டி / பிரம்ம ஞான சபை
302|person|Co-founder of Theosophical Society|Madam H.P. Blavatsky|தியோசபிக்கல் சொசைட்டியின் இணை நிறுவனர்|மேடம் எச்.பி. பிளாவட்ஸ்கி
302|person|Co-founder of Theosophical Society|Colonel H.S. Olcott|தியோசபிக்கல் சொசைட்டியின் இணை நிறுவனர்|கர்னல் எச்.எஸ். ஒல்காட்
302|country|Country where Theosophical Society was founded|United States of America|தியோசபிக்கல் சொசைட்டி தொடங்கப்பட்ட நாடு|அமெரிக்க ஐக்கிய நாடுகள்
302|date|Year Theosophical Society was founded|1875|தியோசபிக்கல் சொசைட்டி நிறுவப்பட்ட ஆண்டு|1875
302|date|Year Blavatsky and Olcott came to India|1879|பிளாவட்ஸ்கி மற்றும் ஒல்காட் இந்தியா வந்த ஆண்டு|1879
302|place|Location of Theosophical Society headquarters in India|Adyar|இந்திய தியோசபிக்கல் சொசைட்டி தலைமையகம் அமைந்த இடம்|அடையாறு
302|date|Year headquarters was established at Adyar|1882|அடையாற்றில் தலைமையகம் அமைந்த ஆண்டு|1882
302|person|Leader under whom Theosophical Society gained strength in India|Annie Besant|இந்தியாவில் தியோசபிக்கல் சொசைட்டி வலுப்பெற்ற தலைவர்|அன்னி பெசன்ட்
302|date|Year Annie Besant came to India|1893|அன்னி பெசன்ட் இந்தியா வந்த ஆண்டு|1893
302|role|Religious revival supported by Theosophical Society|Revival of Buddhism in India|தியோசபிக்கல் சொசைட்டி ஆதரித்த சமய மீளுருவாக்கம்|இந்தியாவில் பௌத்த மறுமலர்ச்சி
302|person|Dalit thinker introduced to modern Buddhism through Olcott|Iyotheethoss Pandithar|ஒல்காட் வழியாக நவீன பௌத்தத்தை அறிந்த தலித் சிந்தனையாளர்|அயோத்திதாச பண்டிதர்
302|country|Country to which Olcott took Iyotheethoss Pandithar|Sri Lanka|ஒல்காட் அயோத்திதாசரை அழைத்துச் சென்ற நாடு|இலங்கை
302|person|Buddhist revivalist met in Sri Lanka by Iyotheethoss|Anagarika Dharmapala|இலங்கையில் அயோத்திதாசர் சந்தித்த பௌத்த மறுமலர்ச்சியாளர்|அனகாரிக தர்மபால
302|person|Buddhist monk/scholar met by Iyotheethoss in Sri Lanka|Acharya Sumangala|இலங்கையில் அயோத்திதாசர் சந்தித்த பௌத்த அறிஞர்|ஆச்சாரிய சுமங்கல

302|movement|Movement founded by Jyotiba Phule in 1873|Satya Shodhak Samaj|1873இல் ஜோதிபா புலே நிறுவிய இயக்கம்|சத்திய சோதக் சமாஜம்
302|person|Founder of Satya Shodhak Samaj|Jyotiba Phule|சத்திய சோதக் சமாஜத்தை நிறுவியவர்|ஜோதிபா புலே
302|community|Community to which Jyotiba Phule belonged|Mali (gardener) community|ஜோதிபா புலே சேர்ந்த சமூகம்|மாலி / தோட்டக்காரர் சமூகம்
302|date|Year Jyotiba Phule was born|1827|ஜோதிபா புலே பிறந்த ஆண்டு|1827
302|school|Type of school where Phule received initial education|Mission school|புலே ஆரம்பக் கல்வி பெற்ற பள்ளி வகை|மிஷன் பள்ளி
302|date|Year Phule had to discontinue initial education|1833|புலே ஆரம்பக் கல்வியை நிறுத்திய ஆண்டு|1833
302|opposition|Social force Phule fought throughout life|Upper caste tyranny|புலே வாழ்நாள் முழுவதும் எதிர்த்த சமூக ஒடுக்குமுறை|மேல்சாதி ஆதிக்கம்
302|text|One text extensively read by Phule|Vedas|புலே விரிவாகப் படித்த நூல்|வேதங்கள்
302|text|One text extensively read by Phule|Manu Samhita|புலே விரிவாகப் படித்த நூல்|மனு சம்ஹிதை
302|text|One tradition studied by Phule|Thought of Buddha and Mahavira|புலே ஆய்ந்த சிந்தனை மரபு|புத்தர் மற்றும் மகாவீரர் சிந்தனை
302|principle|Phule's principle demanding rejection of caste system|Equality|சாதி முறையை முழுமையாக மறுக்க வேண்டும் என கூறிய புலே கொள்கை|சமத்துவம்
302|principle|Phule's principle demanding removal of superstition and ritualism|Rationality|மூடநம்பிக்கை மற்றும் சடங்குகளை நீக்க வேண்டும் என கூறிய புலே கொள்கை|பகுத்தறிவு
302|book|Most important book of Jyotiba Phule|Gulamgiri|ஜோதிபா புலேவின் முக்கிய நூல்|குலாம்கிரி
302|meaning|English meaning given for Gulamgiri|Slavery|குலாம்கிரி என்பதற்குப் பாடநூல் தரும் ஆங்கிலப் பொருள்|அடிமைத்தனம்
302|factor|What Phule viewed as liberating and revolutionary|Education of the masses|புலே விடுதலை மற்றும் புரட்சிகர சக்தி எனக் கருதியது|மக்கள் கல்வி
302|reform|Educational demand Phule made to British Government|Compulsory primary education for masses|பிரிட்டிஷ் அரசிடம் புலே வைத்த கல்விக் கோரிக்கை|மக்களுக்கு கட்டாய ஆரம்பக் கல்வி
302|date|Year Phule started a school for girls in Poona|1851|பூனாவில் புலே பெண்கள் பள்ளி தொடங்கிய ஆண்டு|1851
302|person|Phule's wife who assisted schools for depressed classes|Savitribai Phule|ஒடுக்கப்பட்டோருக்கான பள்ளிகளில் புலேவுக்கு உதவிய மனைவி|சாவித்ரிபாய் புலே
302|institution|Institution Phule founded for widow's children|Home for widow's children|விதவைகளின் குழந்தைகளுக்காக புலே நிறுவிய இல்லம்|விதவைகளின் குழந்தைகளுக்கான இல்லம்
302|movement|Later movement foreshadowed by Phule's work|Non-Brahman movement of Maharashtra|புலே பணியில் தொடக்கத்தை காணும் பிற்கால இயக்கம்|மகாராஷ்டிர பிராமணரல்லாதோர் இயக்கம்

303|person|Woman reformer foremost for emancipation of women|Pandita Ramabai|பெண்கள் விடுதலைக்காக முன்னணியில் பணியாற்றிய சீர்திருத்தவாதி|பண்டிதா ரமாபாய்
303|period|Life span of Pandita Ramabai|1858–1922|பண்டிதா ரமாபாயின் வாழ்நாள்|1858–1922
303|language|Language in which Ramabai was a great scholar|Sanskrit|ரமாபாய் சிறந்த புலமை பெற்ற மொழி|சமஸ்கிருதம்
303|title|One title given to Ramabai for Sanskrit knowledge|Pandita|சமஸ்கிருத அறிவுக்காக ரமாபாய்க்கு வழங்கப்பட்ட பட்டம்|பண்டிதா
303|title|Another title given to Ramabai for Sanskrit knowledge|Saraswati|சமஸ்கிருத அறிவுக்காக ரமாபாய்க்கு வழங்கப்பட்ட மற்றொரு பட்டம்|சரஸ்வதி
303|date|Year Ramabai went to Calcutta with her brother|1878|ரமாபாய் தனது சகோதரருடன் கல்கத்தா சென்ற ஆண்டு|1878
303|date|Year Ramabai married a Bengali of lower social status|1880|ரமாபாய் வேறு சாதி வங்காளியை மணந்த ஆண்டு|1880
303|organization|Organization started by Ramabai in Poona|Arya Mahila Samaj|பூனாவில் ரமாபாய் தொடங்கிய அமைப்பு|ஆரிய மகளிர் சமாஜம்
303|support|Leaders who helped Ramabai start Arya Mahila Samaj|Ranade and Bhandarkar|ஆரிய மகளிர் சமாஜம் தொடங்க ரமாபாய்க்கு உதவியோர்|ரானடே மற்றும் பண்டார்கர்
303|number|Women educated in Arya Mahila Samaj in 1882|300|1882இல் ஆரிய மகளிர் சமாஜத்தில் கல்வி பெற்ற பெண்கள்|300
303|institution|Shelter started by Ramabai for destitute widows|Sharada Sadan|ஆதரவற்ற விதவைகளுக்காக ரமாபாய் தொடங்கிய இல்லம்|சாரதா சதன்
303|place|Place near Poona to which Ramabai shifted activities|Khedgaon|ரமாபாய் தனது பணிகளை மாற்றிய பூனா அருகிலுள்ள இடம்|கேட்கான்
303|institution|Freedom house established by Ramabai at Khedgaon|Mukti Sadan|கேட்கானில் ரமாபாய் நிறுவிய சுதந்திர இல்லம்|முக்தி சதன்
303|number|Children and women housed in Mukti Sadan|2000|முக்தி சதனில் இருந்த பெண்கள் மற்றும் குழந்தைகள்|2000
303|training|Training given at Mukti Sadan|Vocational training|முக்தி சதனில் வழங்கப்பட்ட பயிற்சி|தொழிற்கல்வி

303|person|Leader of Ezhava social movement in Kerala|Sri Narayana Guru|கேரள எழவ சமூக இயக்கத்தை வழிநடத்தியவர்|ஸ்ரீ நாராயண குரு
303|period|Life span of Sri Narayana Guru|1854–1928|ஸ்ரீ நாராயண குருவின் வாழ்நாள்|1854–1928
303|community|Community led by Sri Narayana Guru|Ezhavas|ஸ்ரீ நாராயண குரு வழிநடத்திய சமூகம்|எழவர்கள்
303|occupation|Traditional occupation associated with Ezhavas in lesson|Toddy tapping|பாடநூலில் எழவர்களுடன் தொடர்புபடுத்தப்பட்ட பாரம்பரிய தொழில்|கள் இறக்கும் தொழில்
303|share|Ezhavas' share of Kerala population stated in lesson|26 percent|பாடநூலின்படி கேரள மக்கள் தொகையில் எழவர்களின் பங்கு|26 சதவீதம்
303|language|One language in which Narayana Guru was a scholar|Malayalam|நாராயண குரு புலமை பெற்ற மொழி|மலையாளம்
303|language|One language in which Narayana Guru was a scholar|Tamil|நாராயண குரு புலமை பெற்ற மொழி|தமிழ்
303|language|One language in which Narayana Guru was a scholar|Sanskrit|நாராயண குரு புலமை பெற்ற மொழி|சமஸ்கிருதம்
303|organization|Organization established by Narayana Guru|Sri Narayana Guru Dharma Paripalana Yogam|நாராயண குரு நிறுவிய அமைப்பு|ஸ்ரீ நாராயண குரு தர்ம பரிபாலன யோகம்
303|abbreviation|Abbreviation of Sri Narayana Guru Dharma Paripalana Yogam|SNDP Yogam|ஸ்ரீ நாராயண குரு தர்ம பரிபாலன யோகத்தின் சுருக்கம்|SNDP யோகம்
303|date|Year SNDP Yogam was established|1902|SNDP யோகம் நிறுவப்பட்ட ஆண்டு|1902
303|demand|One SNDP demand|Admission to public schools|SNDP யோகத்தின் ஒரு கோரிக்கை|பொதுப் பள்ளிகளில் சேரும் உரிமை
303|demand|One SNDP demand|Recruitment to government services|SNDP யோகத்தின் ஒரு கோரிக்கை|அரசுப் பணியில் சேரும் உரிமை
303|demand|One SNDP demand|Access to roads and temple entry|SNDP யோகத்தின் ஒரு கோரிக்கை|சாலைகளில் செல்லவும் கோவில்களில் நுழையவும் உரிமை
303|demand|One SNDP demand|Political representation|SNDP யோகத்தின் ஒரு கோரிக்கை|அரசியல் பிரதிநிதித்துவம்
303|person|Poet emerging from SNDP movement|Kumaran Asan|SNDP இயக்கத்திலிருந்து உருவான கவிஞர்|குமாரன் ஆசான்
303|person|Doctor/reformer emerging from SNDP movement|Dr. Palpu|SNDP இயக்கத்திலிருந்து உருவான சீர்திருத்தவாதி|டாக்டர் பால்பு
303|person|Reformer emerging from SNDP movement|Sahodaran Ayyappan|SNDP இயக்கத்திலிருந்து உருவான சீர்திருத்தவாதி|சகோதரன் அய்யப்பன்
303|movement|Temple-street protest influenced by Narayana Guru movement|Vaikom Satyagraha|நாராயண குரு இயக்கத்தின் தாக்கம் பெற்ற கோவில் தெரு போராட்டம்|வைக்கம் சத்தியாகிரகம்

303|movement|Movement started by Syed Ahmad Khan in 1875|Aligarh Movement|1875இல் சையது அகமது கான் தொடங்கிய இயக்கம்|அலிகார் இயக்கம்
303|person|Founder of Aligarh Movement|Syed Ahmad Khan|அலிகார் இயக்கத்தை நிறுவியவர்|சையது அகமது கான்
303|date|Year Aligarh Movement began|1875|அலிகார் இயக்கம் தொடங்கிய ஆண்டு|1875
303|aim|Syed Ahmad Khan's educational-religious aim|Reconcile Western scientific education with Quranic teachings|சையது அகமது கானின் கல்வி-சமய நோக்கம்|மேலை அறிவியல் கல்வியை குரான் போதனைகளுடன் இணைத்தல்
304|aim|One aim of Aligarh Movement|Modern education without weakening allegiance to Islam|அலிகார் இயக்கத்தின் ஒரு நோக்கம்|இஸ்லாமிய பற்றை குறைக்காமல் நவீன கல்வி பரப்புதல்
304|reform|One social issue targeted by Aligarh Movement|Purdah|அலிகார் இயக்கம் கவனம் செலுத்திய சமூகப் பிரச்சினை|பர்தா
304|reform|One social issue targeted by Aligarh Movement|Polygamy|அலிகார் இயக்கம் கவனம் செலுத்திய சமூகப் பிரச்சினை|பலதார மணம்
304|reform|One social issue targeted by Aligarh Movement|Divorce|அலிகார் இயக்கம் கவனம் செலுத்திய சமூகப் பிரச்சினை|விவாகரத்து
304|magazine|Magazine used by Syed Ahmad Khan to spread progressive social ideas|Tahdhib-ul-Akhluq|சையது அகமது கான் முற்போக்கு கருத்துகளை பரப்பிய இதழ்|தஹ்தீப்-உல்-அக்லாக்
304|meaning|Meaning given for Tahdhib-ul-Akhluq|Improvement of Manners and Morals|தஹ்தீப்-உல்-அக்லாக் என்பதற்குக் கொடுக்கப்பட்ட பொருள்|நடத்தை மற்றும் நெறிகளை மேம்படுத்துதல்
304|language|Medium of instruction favoured by Syed Ahmad Khan|English|சையது அகமது கான் விரும்பிய பயிற்றுமொழி|ஆங்கிலம்
304|organization|Society founded by Syed Ahmad Khan in 1864|Scientific Society of Aligarh|1864இல் சையது அகமது கான் நிறுவிய அமைப்பு|அலிகார் அறிவியல் கழகம்
304|date|Year Scientific Society of Aligarh was founded|1864|அலிகார் அறிவியல் கழகம் நிறுவப்பட்ட ஆண்டு|1864
304|aim|Aim of Scientific Society|Introduce Western sciences through Urdu translations|அறிவியல் கழகத்தின் நோக்கம்|மேலை அறிவியலை உருது மொழிபெயர்ப்புகள் மூலம் அறிமுகப்படுத்துதல்
304|place|Place where Syed founded a modern school in 1864|Ghazipur|1864இல் சையது நவீனப் பள்ளி தொடங்கிய இடம்|காஜிப்பூர்
304|date|Year Syed promoted district education committees|1868|மாவட்ட கல்விக் குழுக்களை சையது ஊக்குவித்த ஆண்டு|1868
304|period|Years of Syed Ahmad Khan's Europe visit|1869–1870|சையது அகமது கான் ஐரோப்பா சென்ற காலம்|1869–1870
304|institution|Modern school founded at Aligarh in 1875|Modern Muhammadan school|1875இல் அலிகரில் தொடங்கப்பட்ட கல்வி நிறுவனம்|நவீன முகமதியப் பள்ளி
304|college|College into which Aligarh school developed|Muhammadan Anglo-Oriental College|அலிகார் பள்ளி வளர்ந்த கல்லூரி|முகமதியன் ஆங்கிலோ-ஓரியண்டல் கல்லூரி
304|date|Year Muhammadan Anglo-Oriental College developed|1877|முகமதியன் ஆங்கிலோ-ஓரியண்டல் கல்லூரி உருவான ஆண்டு|1877
304|later|Later institution that grew from MAO College|Muslim University|MAO கல்லூரி பின்னர் வளர்ந்த நிறுவனம்|முஸ்லிம் பல்கலைக்கழகம்
304|conference|Conference founded by Syed Ahmad Khan in 1886|Muhammedan Anglo Oriental Educational Conference|1886இல் சையது அகமது கான் நிறுவிய மாநாடு|முகமதியன் ஆங்கிலோ ஓரியண்டல் கல்வி மாநாடு
304|date|Year Muhammedan Anglo Oriental Educational Conference was founded|1886|முகமதியன் ஆங்கிலோ ஓரியண்டல் கல்வி மாநாடு தொடங்கிய ஆண்டு|1886
304|approach|Syed Ahmad Khan's approach to religious law|Rejected blind adherence|சமயச் சட்டம் குறித்து சையது அகமது கானின் அணுகுமுறை|கண்மூடித் தொடர்வதை மறுத்தார்
304|approach|Syed's approach to Quran|Reinterpret in light of reason|குரான் குறித்து சையது அகமது கானின் அணுகுமுறை|பகுத்தறிவின் வெளிச்சத்தில் மறுவிளக்கம்

304|movement|Movement founded by Mirza Ghulam Ahmed in 1889|Ahmadiya Movement|1889இல் மிர்சா குலாம் அகமது நிறுவிய இயக்கம்|அகமதியா இயக்கம்
304|person|Founder of Ahmadiya Movement|Mirza Ghulam Ahmed|அகமதியா இயக்கத்தை நிறுவியவர்|மிர்சா குலாம் அகமது
304|period|Life span of Mirza Ghulam Ahmed|1835–1908|மிர்சா குலாம் அகமதின் வாழ்நாள்|1835–1908
304|date|Year Ahmadiya Movement was founded|1889|அகமதியா இயக்கம் தொடங்கப்பட்ட ஆண்டு|1889
304|claim|Controversial claim made by Ghulam Ahmed|Claimed to be a Messiah|குலாம் அகமது முன்வைத்த சர்ச்சைக்குரிய கூற்று|தான் மெசையா எனக் கூறினார்
304|aim|Primary work of Ahmadiya movement|Defend Islam against Arya Samaj and Christian polemics|அகமதியா இயக்கத்தின் முக்கிய பணி|ஆரிய சமாஜம் மற்றும் கிறித்தவ வாதங்களுக்கு எதிராக இஸ்லாமை காப்பது
304|social|Ahmadiya position on polygamy|Conservative adherence|பலதார மணம் குறித்து அகமதியா நிலை|பழமைவாத ஆதரவு
304|social|Ahmadiya position on veiling of women|Conservative adherence|பெண்கள் முகத்திரை குறித்து அகமதியா நிலை|பழமைவாத ஆதரவு
304|social|Ahmadiya position on divorce|Classical rules|விவாகரத்து குறித்து அகமதியா நிலை|செவ்வியல் விதிகள்

304|movement|Muslim revivalist movement organised by orthodox ulemas|Deoband Movement|முஸ்லிம் உலமாக்களால் அமைக்கப்பட்ட மீட்டெடுப்பு இயக்கம்|தியோபந்த் இயக்கம்
304|date|Year associated with Deoband Movement heading|1866|தியோபந்த் இயக்கத் தலைப்புடன் குறிப்பிடப்பட்ட ஆண்டு|1866
304|aim|One twin objective of Deoband Movement|Propagate pure Quranic teachings|தியோபந்த் இயக்கத்தின் இரட்டை நோக்கங்களில் ஒன்று|குரானின் தூய போதனைகளை பரப்புதல்
304|aim|Another twin objective of Deoband Movement|Propagate Hadis among Muslims|தியோபந்த் இயக்கத்தின் மற்றொரு நோக்கம்|ஹதீஸ் போதனைகளை பரப்புதல்
304|place|Place where Deoband movement was established|Deoband in Saranpur district|தியோபந்த் இயக்கம் நிறுவப்பட்ட இடம்|சரண்பூர் மாவட்ட தியோபந்த்
304|person|Co-founder of Deoband movement|Mohammad Qasim Nanotavi|தியோபந்த் இயக்கத்தின் இணை நிறுவனர்|முகமது காசிம் நானோதவி
304|period|Life span of Mohammad Qasim Nanotavi|1833–1877|முகமது காசிம் நானோதவியின் வாழ்நாள்|1833–1877
304|person|Co-founder of Deoband movement|Rashid Ahmed Gangohi|தியோபந்த் இயக்கத்தின் இணை நிறுவனர்|ரஷித் அகமது கங்கோஹி
304|period|Life span of Rashid Ahmed Gangohi|1828–1905|ரஷித் அகமது கங்கோஹியின் வாழ்நாள்|1828–1905
304|aim|Institutional aim of Deoband|Train religious leaders for Muslim community|தியோபந்தின் நிறுவன நோக்கம்|முஸ்லிம் சமூகத்திற்கான சமயத் தலைவர்களைப் பயிற்றுவித்தல்
304|contrast|Deoband's contrast with Aligarh|Religious regeneration rather than Western education and support of British|அலிகாருடன் ஒப்பிடுகையில் தியோபந்தின் வேறுபாடு|மேலைக் கல்வி, ஆங்கில ஆதரவுக்கு பதில் சமய புத்துயிர்ப்பு
304|tradition|Instructional tradition followed at Deoband|Classical Islamic tradition|தியோபந்தில் பின்பற்றப்பட்ட கல்வி மரபு|செவ்வியல் இஸ்லாமிய மரபு
304|date|Year Deoband seminary was founded|1867|தியோபந்த் இறையியல் கல்லூரி நிறுவப்பட்ட ஆண்டு|1867
304|school|Theological school associated with Deoband founders|School of Wali-Allah|தியோபந்த் நிறுவனர்களுடன் தொடர்புடைய சிந்தனைப் பள்ளி|வாலி அல்லா சிந்தனைப் பள்ளி
304|aim|One principal objective of Deoband seminary|Reconnect theologians and educated Muslim middle classes|தியோபந்த் கல்லூரியின் ஒரு முக்கிய நோக்கம்|இறையியலாளர்களையும் கல்வியறிவு பெற்ற முஸ்லிம் நடுத்தர வர்க்கத்தையும் மீண்டும் இணைத்தல்
304|aim|One principal objective of Deoband seminary|Revive Muslim religious and scholastic sciences|தியோபந்த் கல்லூரியின் ஒரு முக்கிய நோக்கம்|முஸ்லிம் சமய மற்றும் புலமையியல் அறிவை மீட்டெடுத்தல்
304|status|Status achieved by Deoband|Honoured religious university in Muslim world|தியோபந்த் பெற்ற நிலை|முஸ்லிம் உலகில் மதிப்புமிக்க சமயப் பல்கலைக்கழகம்

305|movement|Less conservative school founded in Lucknow in 1894|Nadwat al-ulama|1894இல் லக்னோவில் தொடங்கிய குறைவான பழமைவாதப் பள்ளி|நட்வத் அல் உலாமா
305|date|Year Nadwat al-ulama was founded|1894|நட்வத் அல் உலாமா நிறுவப்பட்ட ஆண்டு|1894
305|place|City where Nadwat al-ulama was founded|Lucknow|நட்வத் அல் உலாமா நிறுவப்பட்ட நகரம்|லக்னோ
305|person|Historian associated with founding Nadwat al-ulama|Shibli Numani|நட்வத் அல் உலாமா நிறுவலுடன் தொடர்புடைய வரலாற்றாசிரியர்|ஷிப்லி நுமானி
305|aim|Aim of Nadwat al-ulama|Enlightened interpretation of religion against agnosticism and atheism|நட்வத் அல் உலாமாவின் நோக்கம்|அஞ்ஞானவாதம் மற்றும் நாத்திகத்திற்கு எதிராக அறிவார்ந்த சமய விளக்கம்
305|school|Older traditional Muslim school in Lucknow|Farangi Mahal|லக்னோவின் பழைய பாரம்பரிய முஸ்லிம் சிந்தனைப் பள்ளி|ஃபிரங்கி மஹால்
305|doctrine|Religious tradition accepted by Farangi Mahal as valid experience|Sufism|ஃபிரங்கி மஹால் மதிப்புமிக்க அனுபவமாக ஏற்ற சமய மரபு|சூபியம்
305|movement|Traditionalist movement of followers of Prophet's dicta|Ahl-i-hadith|நபியின் சொற்களைப் பின்பற்றிய பாரம்பரிய இயக்கம்|அஹ்ல்-இ-ஹதீத்

305|movement|Parsi religious reform association founded in 1851|Rahnumai Madayasnan Sabha|1851இல் நிறுவப்பட்ட பார்சி சமய சீர்திருத்த அமைப்பு|ரஹ்னுமாய் மத்யஸ்னன் சபா
305|date|Year Rahnumai Madayasnan Sabha was founded|1851|ரஹ்னுமாய் மத்யஸ்னன் சபா நிறுவப்பட்ட ஆண்டு|1851
305|group|Community that founded Rahnumai Madayasnan Sabha|English-educated Parsis|ரஹ்னுமாய் மத்யஸ்னன் சபா நிறுவிய குழு|ஆங்கிலக் கல்வி பெற்ற பார்சிகள்
305|aim|One aim of Parsi reform association|Regenerate social conditions of Parsis|பார்சி சீர்திருத்த அமைப்பின் ஒரு நோக்கம்|பார்சிகளின் சமூக நிலையை மேம்படுத்துதல்
305|aim|One aim of Parsi reform association|Restore Zoroastrian religion to pristine purity|பார்சி சீர்திருத்த அமைப்பின் ஒரு நோக்கம்|ஜொராஸ்டிரிய சமயத்தை அதன் தூய நிலைக்கு மீட்டெடுத்தல்
305|person|Leader of Parsi reform movement|Naoroji Furdonji|பார்சி சீர்திருத்த இயக்கத் தலைவர்|நவ்ரோஜி ஃபர்தோன்ஜி
305|person|Leader of Parsi reform movement|Dadabhai Naoroji|பார்சி சீர்திருத்த இயக்கத் தலைவர்|தாதாபாய் நௌரோஜி
305|person|Leader of Parsi reform movement|K.R. Cama|பார்சி சீர்திருத்த இயக்கத் தலைவர்|கே.ஆர். காமா
305|person|Leader of Parsi reform movement|S.S. Bengalee|பார்சி சீர்திருத்த இயக்கத் தலைவர்|எஸ்.எஸ். பெங்காலி
305|newspaper|Newspaper spreading Parsi reform message|Rast-Goftar|பார்சி சீர்திருத்தச் செய்தியை பரப்பிய செய்தித்தாள்|ராஸ்ட்-கோஃப்தார்
305|meaning|Meaning of Rast-Goftar|Truth Teller|ராஸ்ட்-கோஃப்தார் என்பதன் பொருள்|உண்மை விளம்பி
305|reform|One Parsi women's reform|Education of women|பார்சி பெண்கள் முன்னேற்றத்திற்கான ஒரு சீர்திருத்தம்|பெண் கல்வி
305|reform|One Parsi women's reform|Removal of purdah|பார்சி பெண்கள் முன்னேற்றத்திற்கான ஒரு சீர்திருத்தம்|பர்தா முறையை நீக்குதல்
305|reform|One Parsi women's reform|Raising age of marriage|பார்சி பெண்கள் முன்னேற்றத்திற்கான ஒரு சீர்திருத்தம்|திருமண வயதை உயர்த்துதல்
305|result|Social result of Parsi reforms|Parsis became highly westernised|பார்சி சீர்திருத்தங்களின் சமூக விளைவு|பார்சிகள் அதிகமாக மேலைமயமான சமூகமாக மாறினர்
305|role|One national role of Parsis|Key role in nationalist movement|பார்சிகள் வகித்த தேசிய பங்கு|தேசிய இயக்கத்தில் முக்கிய பங்கு
305|role|One economic role of Parsis|Key role in industrialization of India|பார்சிகள் வகித்த பொருளாதார பங்கு|இந்திய தொழில்மயமாக்கலில் முக்கிய பங்கு

305|movement|Sikh reform movement formed in 1873|Singh Sabha Movement|1873இல் உருவான சீக்கிய சீர்திருத்த இயக்கம்|சிங் சபா இயக்கம்
305|date|Year Singh Sabha Movement was formed|1873|சிங் சபா இயக்கம் தொடங்கப்பட்ட ஆண்டு|1873
305|aim|One aim of Singh Sabha Movement|Modern Western education for Sikhs|சிங் சபா இயக்கத்தின் ஒரு நோக்கம்|சீக்கியர்களுக்கு நவீன மேலைக் கல்வி
305|aim|One aim of Singh Sabha Movement|Counter Christian missionary proselytization|சிங் சபா இயக்கத்தின் ஒரு நோக்கம்|கிறித்தவ மதமாற்ற முயற்சிகளை எதிர்த்தல்
305|aim|One aim of Singh Sabha Movement|Counter Hindu revivalists|சிங் சபா இயக்கத்தின் ஒரு நோக்கம்|இந்து மீட்டெடுப்பு இயக்கங்களை எதிர்த்தல்
305|institution|Schools established across Punjab by Singh Sabha Movement|Khalsa Schools|சிங் சபா இயக்கம் பஞ்சாபில் நிறுவிய பள்ளிகள்|கால்சா பள்ளிகள்
305|movement|Offshoot of Singh Sabha Movement|Akali Movement|சிங் சபா இயக்கத்தின் கிளை இயக்கம்|அகாலி இயக்கம்
305|aim|Aim of Akali Movement|Liberate Sikh Gurudwaras from Udasi Mahants|அகாலி இயக்கத்தின் நோக்கம்|உதாசி மஹந்த்களின் கட்டுப்பாட்டிலிருந்து குருத்வாராக்களை விடுவித்தல்
305|act|Law passed for Sikh Gurudwara control|Sikh Gurudwara Act|சீக்கிய குருத்வாரா நிர்வாகத்திற்காக இயற்றப்பட்ட சட்டம்|சீக்கிய குருத்வாரா சட்டம்
305|date|Year Sikh Gurudwara Act was passed|1922|சீக்கிய குருத்வாரா சட்டம் இயற்றப்பட்ட ஆண்டு|1922
305|date|Year Sikh Gurudwara Act was amended|1925|சீக்கிய குருத்வாரா சட்டம் திருத்தப்பட்ட ஆண்டு|1925
305|body|Main body controlling Gurudwaras after the Act|Shiromani Gurudwara Prabandhak Committee (SGPC)|சட்டத்திற்குப் பின் குருத்வாராக்களை கட்டுப்படுத்திய அமைப்பு|சிரோமணி குருத்வாரா பிரபந்தக் கமிட்டி (SGPC)

305|region|Indian region where Brahmo and Arya Samaj branches also operated|Tamil Nadu|பிரம்ம மற்றும் ஆரிய சமாஜ கிளைகள் இயங்கிய இந்தியப் பகுதி|தமிழ்நாடு
305|person|Brahmo leader who visited Madras and lectured|Keshab Chandra Sen|மதராஸ் வந்து சொற்பொழிவாற்றிய பிரம்ம சமாஜத் தலைவர்|கேசப் சந்திர சென்
305|person|Tamil reformer also called Vallalar|Ramalinga Swamigal|வள்ளலார் என அழைக்கப்பட்ட தமிழ் சீர்திருத்தவாதி|இராமலிங்க சுவாமிகள்
305|alternate|Other name of Ramalinga Swamigal|Vallalar|இராமலிங்க சுவாமிகளின் மற்றொரு பெயர்|வள்ளலார்
305|period|Life span of Ramalinga Swamigal|1823–1874|இராமலிங்க சுவாமிகளின் வாழ்நாள்|1823–1874
305|place|Region near which Ramalinga Swamigal was born|Chidambaram|இராமலிங்க சுவாமிகள் பிறந்த பகுதி|சிதம்பரம் அருகில்
305|place|City where Ramalinga spent early life|Madras|இராமலிங்கர் ஆரம்ப வாழ்க்கையை கழித்த நகரம்|மதராஸ்
305|education|Formal schooling of Ramalinga Swamigal|No formal schooling|இராமலிங்கரின் முறையான கல்வி நிலை|முறையான பள்ளிக்கல்வி இல்லை
305|source|Devotional hymns inspiring Ramalinga|Saiva Thevaram and Thiruvasagam|இராமலிங்கரைத் தூண்டிய பக்திப் பாடல்கள்|சைவ தேவாரம் மற்றும் திருவாசகம்
305|institution|One Saiva monastery cited in Ramalinga context|Thiruvaduthurai|இராமலிங்கர் கால சைவ மடங்களில் ஒன்று|திருவாவடுதுறை
305|institution|One Saiva monastery cited in Ramalinga context|Dharumapuram|இராமலிங்கர் கால சைவ மடங்களில் ஒன்று|தருமபுரம்
305|institution|One Saiva monastery cited in Ramalinga context|Thiruppanandal|இராமலிங்கர் கால சைவ மடங்களில் ஒன்று|திருப்பனந்தாள்
305|institution|Charitable feeding centre established by Ramalinga|Sathya Dharma Salai|இராமலிங்கர் நிறுவிய அன்னதான நிலையம்|சத்திய தர்ம சாலை
305|place|Place where Sathya Dharma Salai was established|Vadalur|சத்திய தர்ம சாலை நிறுவப்பட்ட இடம்|வடலூர்
305|context|Crisis during which Ramalinga fed poor irrespective of caste and creed|Famine and pestilence of the 1860s|சாதி மத வேறுபாடின்றி இராமலிங்கர் ஏழைகளுக்கு உணவளித்த சூழல்|1860களின் பஞ்சமும் தொற்றுநோயும்
305|institution|Organization founded by Ramalinga for followers|Sathya Gnana Sabhai|இராமலிங்கர் தனது अनुயாயர்களுக்காக நிறுவிய அமைப்பு|சத்திய ஞான சபை
305|work|Title under which Ramalinga's poems were published|Thiruvarutpa|இராமலிங்கரின் பாடல்கள் வெளியிடப்பட்ட தலைப்பு|திருவருட்பா
305|date|Year Thiruvarutpa was published by followers|1867|திருவருட்பா வெளியிடப்பட்ட ஆண்டு|1867
305|person|Sri Lankan Saivite reformer opposing Ramalinga's publication|Arumuga Navalar|திருவருட்பாவை எதிர்த்த இலங்கை சைவ சீர்திருத்தவாதி|ஆறுமுக நாவலர்
305|debate|Conflict between Ramalinga's followers and orthodox Saivites|Tract war|இராமலிங்கர் ஆதரவாளர்களுக்கும் வைதீக சைவத்திற்கும் இடையிலான மோதல்|துண்டுப் பிரசுரப் போர்
305|effect|Broader religious effect of Ramalinga's writings|Undermined sectarianism in Saivism|இராமலிங்கர் எழுத்துகளின் பரந்த சமய விளைவு|சைவத்தில் பிரிவினைவாதத்தை பலவீனப்படுத்தியது

306|date|Year complete Jeevaka Chintamani edition became a landmark in Buddhist revival|1887|பௌத்த மறுமலர்ச்சியில் சீவக சிந்தாமணி முழுப் பதிப்பு முக்கியமான ஆண்டு|1887
306|work|Classical work whose complete edition in 1887 marked heterodox recovery|Jeevaka Chintamani|1887 முழுப் பதிப்பால் அவைதீக மரபு மீட்பில் முக்கியமான நூல்|சீவக சிந்தாமணி
306|date|Year Manimekalai publication became a landmark|1898|மணிமேகலை வெளியீடு முக்கியமான ஆண்டு|1898
306|work|Classical Buddhist-linked work published in 1898|Manimekalai|1898இல் வெளியான பௌத்த மரபு தொடர்புடைய காப்பியம்|மணிமேகலை
306|person|Most important figure of Tamil Buddhist revival in lesson|Iyotheethoss Pandithar|பாடநூலில் தமிழ் பௌத்த மறுமலர்ச்சியின் முக்கிய நபர்|அயோத்திதாச பண்டிதர்
306|period|Life span of Iyotheethoss Pandithar|1845–1914|அயோத்திதாச பண்டிதரின் வாழ்நாள்|1845–1914
306|profession|Profession of Iyotheethoss Pandithar|Native doctor|அயோத்திதாச பண்டிதரின் தொழில்|நாட்டு மருத்துவர்
306|influence|Theosophical leader who influenced Iyotheethoss|Colonel Olcott|அயோத்திதாசரைப் பாதித்த தியோசபிக்கல் தலைவர்|கர்னல் ஒல்காட்
306|period|Decade in which Iyotheethoss began Adi Dravidar movement|1890s|அயோத்திதாசர் ஆதிதிராவிடர் இயக்கத்தைத் தொடங்கிய காலம்|1890கள்
306|claim|Iyotheethoss's argument about Adi Dravidars|They were original Buddhists|ஆதிதிராவிடர்கள் குறித்து அயோத்திதாசரின் வாதம்|அவர்கள் மூல பௌத்தர்கள்
306|cause|Iyotheethoss's explanation for untouchability|Opposition to Vedic Brahminism|தீண்டாமைக்கு அயோத்திதாசர் கூறிய காரணம்|வேத பிராமணியத்துக்கு எதிர்ப்பு
306|region|Region where Iyotheethoss found greatest following|North Tamil Nadu|அயோத்திதாசருக்கு அதிக ஆதரவு கிடைத்த பகுதி|வட தமிழ்நாடு
306|workforce|Workers among whom Iyotheethoss had strong following|Kolar Gold Fields working classes|அயோத்திதாசருக்கு வலுவான ஆதரவு இருந்த தொழிலாளர் குழு|கோலார் தங்கவயல் தொழிலாளர்கள்
306|person|Leader associated with Iyotheethoss movement|M. Singavelu|அயோத்திதாசர் இயக்கத்துடன் தொடர்புடையவர்|எம். சிங்காரவேலு
306|person|Scholar associated with Iyotheethoss movement|Prof. P. Lakshmi Narasu|அயோத்திதாசர் இயக்கத்துடன் தொடர்புடைய அறிஞர்|பேரா. பி. லட்சுமி நரசு
306|journal|Weekly journal run by Iyotheethoss|Oru Paisa Tamilan|அயோத்திதாசர் நடத்திய வார இதழ்|ஒரு பைசா தமிழன்
306|later|Later name of Oru Paisa Tamilan|Tamilan|ஒரு பைசா தமிழன் பின்னர் பெற்ற பெயர்|தமிழன்
306|date|Year from which Iyotheethoss ran Oru Paisa Tamilan|1908|அயோத்திதாசர் ஒரு பைசா தமிழன் நடத்திய தொடக்க ஆண்டு|1908

306|policy|Official East India Company religious policy|Neutrality toward native religions|கிழக்கிந்தியக் கம்பெனியின் அதிகாரப்பூர்வ சமயக் கொள்கை|உள்ளூர் சமயங்களில் நடுநிலை
306|reason|Reason Company feared missionary entry|Belief Portuguese rule ended due to forced conversions|மறைப்பணியாளர் நுழைவை கம்பெனி அஞ்சிய காரணம்|கட்டாய மதமாற்றம் போர்த்துக்கீசிய ஆட்சியை வீழ்த்தியது என்ற நம்பிக்கை
306|policy|Company action regarding missionaries|Prohibited their entry into controlled territories|மறைப்பணியாளர்கள் குறித்து கம்பெனி எடுத்த நடவடிக்கை|கம்பெனி பகுதிகளில் நுழைவதைத் தடுத்தது
306|person|English Baptist missionary who came to India in 1793|William Carey|1793இல் இந்தியா வந்த ஆங்கில பாப்டிஸ்ட் மறைப்பணியாளர்|வில்லியம் கேரி
306|person|English Baptist missionary who accompanied Carey|John Thomas|வில்லியம் கேரியுடன் வந்த பாப்டிஸ்ட் மறைப்பணியாளர்|ஜான் தாமஸ்
306|date|Year Carey and Thomas set out for India|1793|கேரி மற்றும் தாமஸ் இந்தியா வந்த ஆண்டு|1793
306|place|Danish colony where missionaries settled due to Company ban|Serampore|கம்பெனி தடையால் மறைப்பணியாளர்கள் குடியேறிய டேனிஷ் குடியேற்றம்|சேராம்பூர்
306|person|Missionary who joined Carey in Serampore Mission|Joshua Marshman|சேராம்பூர் மிஷனில் கேரியுடன் இணைந்தவர்|ஜோஷுவா மார்ஷ்மன்
306|person|Missionary who joined Carey in Serampore Mission|William Ward|சேராம்பூர் மிஷனில் கேரியுடன் இணைந்தவர்|வில்லியம் வார்ட்
306|mission|Mission established in 1799|Serampore Mission|1799இல் நிறுவப்பட்ட மறைப்பணி அமைப்பு|சேராம்பூர் மிஷன்
306|date|Year Serampore Mission was established|1799|சேராம்பூர் மிஷன் நிறுவப்பட்ட ஆண்டு|1799
306|denomination|Denomination of first evangelical missionaries at Serampore|Baptist|சேராம்பூர் முதல் சுவிசேஷ மறைப்பணியாளர்களின் பிரிவு|பாப்டிஸ்ட்
306|region|One earlier Christian mission region|Goa|முன்னிருந்த கிறித்தவ மறைப்பணிப் பகுதி|கோவா
306|region|One earlier Christian mission region|Malabar Coast|முன்னிருந்த கிறித்தவ மறைப்பணிப் பகுதி|மலபார் கடற்கரை
306|region|One earlier Christian mission region|Coromandel Coast|முன்னிருந்த கிறித்தவ மறைப்பணிப் பகுதி|கொரோமண்டல் கடற்கரை
306|period|Century when major proselytization attempts began|Nineteenth century|பெரிய அளவிலான மதமாற்ற முயற்சிகள் தொடங்கிய நூற்றாண்டு|19ஆம் நூற்றாண்டு
307|service|Missionary educational service for deprived groups|Schools|பின்தங்கியோருக்கான மறைப்பணியாளர் கல்விச் சேவை|பள்ளிகள்
307|right|One civil right missionaries supported|Access to public roads|மறைப்பணியாளர்கள் ஆதரித்த ஒரு குடிமை உரிமை|பொது சாலைகளில் செல்லும் உரிமை
307|right|One civil right missionaries supported for women|Right to wear upper garments|பெண்களுக்காக மறைப்பணியாளர்கள் ஆதரித்த உரிமை|மேலாடை அணியும் உரிமை
307|service|Missionary service for orphaned children and widows|Shelter and boarding education|அனாதை குழந்தைகள் மற்றும் விதவைகளுக்கான மறைப்பணியாளர் சேவை|அடைக்கலமும் விடுதி கல்வியும்
307|context|Crisis during which missionaries organized relief|Famines|மறைப்பணியாளர்கள் நிவாரணம் செய்த பேரிடர்|பஞ்சங்கள்
307|region|District where many villages embraced Christianity during famines|Tirunelveli|பஞ்ச காலங்களில் பல கிராமங்கள் கிறித்தவத்தை ஏற்ற மாவட்டம்|திருநெல்வேலி
307|period|Time when Tirunelveli conversions were notable|Last quarter of nineteenth century|திருநெல்வேலியில் மதமாற்றம் குறிப்பிடத்தக்க காலம்|19ஆம் நூற்றாண்டின் கடைசி காலாண்டு
307|group|Andhra community that embraced Christianity in large numbers|Malas|ஆந்திராவில் பெருமளவில் கிறித்தவத்தை ஏற்ற சமூகத்தினர்|மாலாக்கள்
307|group|Another Andhra community that embraced Christianity|Madigas|ஆந்திராவில் பெருமளவில் கிறித்தவத்தை ஏற்ற மற்றொரு சமூகத்தினர்|மாதிகாக்கள்
307|service|Modern institution missionaries took initiative to establish|Hospitals|மறைப்பணியாளர்கள் தொடங்க முனைந்த நவீன நிறுவனம்|மருத்துவமனைகள்
307|service|Modern institution missionaries took initiative to establish|Dispensaries|மறைப்பணியாளர்கள் தொடங்க முனைந்த நவீன நிறுவனம்|மருந்தகங்கள்

307|reaction|One reaction faced by socio-religious reformers|Abuse|சமூக-சமய சீர்திருத்தவாதிகள் சந்தித்த ஒரு எதிர்வினை|தூற்றல்
307|reaction|One reaction faced by socio-religious reformers|Persecution|சமூக-சமய சீர்திருத்தவாதிகள் சந்தித்த ஒரு எதிர்வினை|துன்புறுத்தல்
307|reaction|One reaction faced by socio-religious reformers|Fatwas|சமூக-சமய சீர்திருத்தவாதிகள் சந்தித்த ஒரு எதிர்வினை|ஃபத்வாக்கள்
307|reaction|One reaction faced by socio-religious reformers|Assassination attempts|சமூக-சமய சீர்திருத்தவாதிகள் சந்தித்த ஒரு எதிர்வினை|கொலை முயற்சிகள்
307|effect|One effect of reform movements on individuals|Liberation from conformity born of fear|சீர்திருத்த இயக்கங்களின் தனிநபர் விளைவு|பயத்தால் உருவான கட்டுப்பாட்டிலிருந்து விடுதலை
307|method|Reform practice making religious knowledge more accessible|Translation of religious texts into vernaculars|சமய அறிவை மக்களுக்கு அணுகத்தக்கதாக்கிய சீர்திருத்த நடைமுறை|சமய நூல்களை தாய்மொழிகளில் மொழிபெயர்த்தல்
307|right|Religious principle emphasized by reform movements|Individual's right to interpret scriptures|சீர்திருத்த இயக்கங்கள் வலியுறுத்திய சமய உரிமை|சமய நூல்களை தனிநபர் விளக்க உரிமை
307|effect|Effect of simplifying rituals|Made worship more personal|சடங்குகளை எளிமைப்படுத்தியதன் விளைவு|வழிபாட்டை தனிப்பட்ட அனுபவமாக மாற்றியது
307|principle|Human faculty emphasized by reformers|Capacity to reason and think|சீர்திருத்தவாதிகள் வலியுறுத்திய மனித திறன்|பகுத்தறிந்து சிந்திக்கும் திறன்
307|effect|Cultural benefit to rising middle classes|Provided cultural roots|உயரும் நடுத்தர வர்க்கத்திற்கு சீர்திருத்த இயக்கங்கள் அளித்த பண்பாட்டு பயன்|பண்பாட்டு வேர்களை அளித்தது
""".strip()

facts=[]
seen=set()
for line in RAW.splitlines():
    if not line.strip():
        continue
    parts=line.split("|")
    if len(parts)!=6:
        raise ValueError(f"Bad line ({len(parts)} fields): {line}")
    p,k,de,ae,dt,at=parts
    de=" ".join(de.split()); ae=" ".join(ae.split()); dt=" ".join(dt.split()); at=" ".join(at.split())
    key=(de.lower(),ae.lower())
    if key in seen:
        continue
    seen.add(key)
    facts.append({"page_en":int(p),"kind":k,"desc_en":de,"ans_en":ae,"desc_ta":dt,"ans_ta":at})

pools=defaultdict(list)
for f in facts:
    pools[f["kind"]].append(f)

def distractors(f,n=3):
    candidates=[x for x in pools[f["kind"]] if x["ans_en"].lower()!=f["ans_en"].lower()]
    candidates.sort(key=lambda x:(abs(x["page_en"]-f["page_en"]),x["ans_en"]))
    out=[]; used=set()
    for x in candidates:
        key=x["ans_en"].lower()
        if key not in used:
            out.append(x); used.add(key)
        if len(out)==n: break
    if len(out)<n:
        for x in facts:
            key=x["ans_en"].lower()
            if key!=f["ans_en"].lower() and key not in used:
                out.append(x); used.add(key)
            if len(out)==n: break
    return out

def make_opts(f,seed):
    arr=[f]+distractors(f,3)
    random.Random(seed).shuffle(arr)
    return [x["ans_en"] for x in arr],[x["ans_ta"] for x in arr],arr.index(f)

questions=[]; qid=1
def add(page,qen,qta,oe,ot,c,een,eta,typ):
    global qid
    questions.append({
      "id":f"C11H19-Q{qid:04d}",
      "quiz":(qid-1)//20+1,
      "page_en":page,
      "q_en":qen,"q_ta":qta,
      "opts_en":oe,"opts_ta":ot,
      "correct":c,
      "exp_en":een,"exp_ta":eta,
      "type":typ
    })
    qid+=1

templates=[
 ("direct","What is the correct textbook answer for: ","இதற்கான சரியான பாடநூல் விடை எது: "),
 ("association","Which option is correctly associated with the following description: ","பின்வரும் விளக்கத்துடன் சரியாகப் பொருந்தும் விடை எது: "),
 ("recognition","Identify the person/place/term linked by the textbook with this fact: ","இந்த பாடநூல் உண்மையுடன் தொடர்புடைய நபர்/இடம்/சொல்லைத் தேர்ந்தெடுக்கவும்: ")
]
for i,f in enumerate(facts):
    een=f'{f["desc_en"]}: {f["ans_en"]}.'
    eta=f'{f["desc_ta"]}: {f["ans_ta"]}.'
    for j,(typ,pfx_en,pfx_ta) in enumerate(templates):
        oe,ot,c=make_opts(f,19000+i*47+j*100003)
        add(f["page_en"],pfx_en+f["desc_en"]+"?",pfx_ta+f["desc_ta"]+"?",oe,ot,c,een,eta,typ)

comb_en=["Both I and II are correct","I is correct; II is incorrect","I is incorrect; II is correct","Both I and II are incorrect"]
comb_ta=["I மற்றும் II இரண்டும் சரி","I சரி; II தவறு","I தவறு; II சரி","I மற்றும் II இரண்டும் தவறு"]
for i,f in enumerate(facts):
    g=facts[(i+1)%len(facts)]
    mode=i%4
    iok=mode in (0,1); iiok=mode in (0,2)
    wf=distractors(f,1)[0]; wg=distractors(g,1)[0]
    a1=f["ans_en"] if iok else wf["ans_en"]
    t1=f["ans_ta"] if iok else wf["ans_ta"]
    a2=g["ans_en"] if iiok else wg["ans_en"]
    t2=g["ans_ta"] if iiok else wg["ans_ta"]
    qen=f'Consider the following statements:\nI. {f["desc_en"]} — {a1}.\nII. {g["desc_en"]} — {a2}.\nWhich option is correct?'
    qta=f'பின்வரும் கூற்றுகளைக் கவனிக்கவும்:\nI. {f["desc_ta"]} — {t1}.\nII. {g["desc_ta"]} — {t2}.\nசரியான விடை எது?'
    exen=["Both Statement I and Statement II are correct.","Statement I is correct and Statement II is incorrect.","Statement I is incorrect and Statement II is correct.","Both Statement I and Statement II are incorrect."][mode]
    exta=["கூற்று I மற்றும் II இரண்டும் சரி.","கூற்று I சரி; கூற்று II தவறு.","கூற்று I தவறு; கூற்று II சரி.","கூற்று I மற்றும் II இரண்டும் தவறு."][mode]
    add(max(f["page_en"],g["page_en"]),qen,qta,comb_en,comb_ta,mode,exen,exta,"statement-analysis")

unique=[]; sigs=set()
for q in questions:
    sig=(q["q_en"],tuple(q["opts_en"]))
    if sig in sigs:
        continue
    sigs.add(sig); unique.append(q)
questions=unique
for i,q in enumerate(questions,1):
    q["id"]=f"C11H19-Q{i:04d}"
    q["quiz"]=(i-1)//20+1

quiz_count=(len(questions)+19)//20
sets=[{"id":i,"title_en":f"Quiz {i} · Competitive Review","title_ta":f"வினாடி வினா {i} · போட்டித் தேர்வு மீள்பார்வை"} for i in range(1,quiz_count+1)]
counts=Counter("ABCD"[q["correct"]] for q in questions)
dups=len(questions)-len({(q["q_en"],tuple(q["opts_en"])) for q in questions})

out={"meta":{
  "board":"Tamil Nadu State Board",
  "class":11,
  "subject":"History",
  "edition":2025,
  "unit":19,
  "unit_en":"Towards Modernity",
  "unit_ta":"நவீனத்தை நோக்கி",
  "source":"Government of Tamil Nadu Higher Secondary First Year History, Revised Edition 2025, English and Tamil editions supplied by the user",
  "total_questions":len(questions),
  "base_facts":len(facts),
  "quiz_sets":sets,
  "question_style":"Maximum useful source-grounded bilingual competitive-exam coverage from Unit 19: emergence and ideology of reform movements; Brahmo, Prarthana and Arya Samaj; Ramakrishna Mission and Vivekananda; Theosophical Society; Satya Shodhak Samaj and Jyotiba Phule; Pandita Ramabai and Sri Narayana Guru; Aligarh, Ahmadiya, Deoband, Nadwat al-ulama and Farangi Mahal; Parsi and Sikh reform movements; Ramalinga Swamigal and Iyotheethoss Pandithar; Christian missionaries and significance of reform movements.",
  "quality_policy":"Four-option bilingual MCQs grounded in the supplied 2025 English and Tamil textbooks. Activities and assignment prompts are excluded. Examinable dates, founders, institutions, publications, aims, doctrines, social reforms, places and conceptual distinctions are reinforced through direct recall, association, recognition and statement-analysis formats. Textbook terminology and framing are preserved.",
  "page_reference_note":"page_en refers to the printed English textbook page.",
  "qa_all_four_options":all(len(q["opts_en"])==4 and len(q["opts_ta"])==4 for q in questions),
  "qa_valid_correct_indexes":all(0<=q["correct"]<4 for q in questions),
  "qa_duplicate_ids":len(questions)-len({q["id"] for q in questions}),
  "qa_exact_duplicate_question_options":dups,
  "qa_answer_position_counts":dict(counts)
},"questions":questions}

os.makedirs(os.path.dirname(OUT),exist_ok=True)
with open(OUT,"w",encoding="utf-8") as fp:
    json.dump(out,fp,ensure_ascii=False,indent=2)

print(f"Wrote {OUT}: {len(facts)} facts, {len(questions)} questions, {quiz_count} quizzes")
