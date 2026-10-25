import json, random, os
from collections import defaultdict, Counter

OUT="data/textbook/class-11/history/unit-17.json"
random.seed(1702026)

# page_en, kind, description_en, answer_en, description_ta, answer_ta
F=[
# Introduction
(264,"cause","Political condition that enabled an English trading company to take over India","Breakdown of central authority after the Mughal decline","ஒரு ஆங்கில வணிக நிறுவனம் இந்தியாவை கைப்பற்ற வழிவகுத்த அரசியல் நிலை","முகலாய வீழ்ச்சிக்குப் பின் மைய அதிகாரத்தின் சிதைவு"),
(264,"objective","Initial objective of the English East India Company in India","Smooth trade, not administration","இந்தியாவில் ஆங்கில கிழக்கிந்தியக் கம்பெனியின் ஆரம்ப நோக்கம்","நிர்வாகம் அல்ல; தடையற்ற வாணிபம்"),
(264,"date","Year of the terrible Bengal famine that altered Company attitudes to responsibility","1770","கம்பெனியின் பொறுப்புணர்வில் மாற்றம் ஏற்படுத்திய வங்காளப் பஞ்ச ஆண்டு","1770"),
(264,"policy","Professed British objective despite exploitative economic policy","Safety of the governed and administration of justice","சுரண்டல் பொருளாதாரக் கொள்கையின்போதும் ஆங்கிலேயர் கூறிய நோக்கம்","மக்கள் பாதுகாப்பும் நீதி நிர்வாகமும்"),
(264,"justification","British justification for expansionist policy","Ending tyranny and harassment by robbers and marauders","ஆங்கிலேய விரிவாக்கக் கொள்கைக்குக் கூறப்பட்ட நியாயம்","உள்ளூர் கொடுங்கோன்மையும் கள்வர் தொல்லையும் ஒழித்தல்"),
(264,"technology","Communication system used both for easier communication and control","Telegraph","தொடர்புக்கும் மக்கள் கட்டுப்பாட்டிற்கும் பயன்படுத்தப்பட்ட தொடர்பு முறை","தந்தி"),
(264,"technology","Transport system also serving to curb resistance and control people","Railways","எதிர்ப்பை ஒடுக்கவும் மக்களை கட்டுப்படுத்தவும் உதவிய போக்குவரத்து அமைப்பு","இருப்புப்பாதை"),
(264,"effect","Overall impact of British agrarian and commercial policies","Ruinous impact on the economy","ஆங்கிலேய வேளாண்மை மற்றும் வாணிபக் கொள்கைகளின் மொத்த விளைவு","இந்திய பொருளாதாரத்திற்கு அழிவான தாக்கம்"),
(264,"migration","Groups increasingly emigrating to plantations by the 1830s","Ruined peasants and weavers","1830களில் தோட்டங்களுக்கு அதிகமாக குடிபெயர்ந்த குழுக்கள்","பாதிக்கப்பட்ட விவசாயிகளும் நெசவாளர்களும்"),

# British Raj and Buxar
(264,"battle","Battle described as the real foundation battle for British dominion in India","Battle of Buxar","இந்தியாவில் ஆங்கிலேய ஆதிக்கத்தின் உண்மையான அடித்தளப் போர்","பக்சார் போர்"),
(264,"ruler","Mughal emperor who opposed the British at Buxar","Shah Alam II","பக்சார் போரில் ஆங்கிலேயரை எதிர்த்த முகலாய பேரரசர்","இரண்டாம் ஷா ஆலம்"),
(264,"state","One Nawab state opposing the British at Buxar","Bengal","பக்சார் போரில் ஆங்கிலேயரை எதிர்த்த நவாப் அரசு","வங்காளம்"),
(264,"state","Another Nawab state opposing the British at Buxar","Oudh","பக்சார் போரில் ஆங்கிலேயரை எதிர்த்த மற்றொரு நவாப் அரசு","அவத்"),
(265,"effect","Transformation of East India Company after Buxar","From merchant company to formidable political force","பக்சார் போருக்குப் பின் கிழக்கிந்தியக் கம்பெனியின் மாற்றம்","வணிக நிறுவனத்திலிருந்து வலுவான அரசியல் சக்தியாக மாறியது"),
(265,"person","Company leader appointed Governor of Fort William after Buxar","Robert Clive","பக்சார் போருக்குப் பின் வில்லியம் கோட்டை ஆளுநராக நியமிக்கப்பட்டவர்","ராபர்ட் கிளைவ்"),
(265,"person","Clive's predecessor associated with restoring Oudh to Shah Alam","Vansittart","அவத்தை ஷா ஆலமிடம் மீள ஒப்படைத்த கிளைவின் முன்னாள் ஆளுநர்","வான்சிடார்ட்"),
(265,"person","Ruler with whom Clive opened fresh negotiations regarding Oudh","Shuja-ud-daulah","அவத் தொடர்பாக கிளைவ் புதிய பேச்சுவார்த்தை நடத்தியவர்","ஷுஜா-உத்-தௌலா"),
(265,"treaty","Treaties concluded after Clive's negotiations with Shuja-ud-daulah","Treaties of Allahabad","கிளைவ்-ஷுஜா பேச்சுவார்த்தைக்குப் பின் கையெழுத்தான உடன்படிக்கைகள்","அலகாபாத் உடன்படிக்கைகள்"),
(265,"right","Fiscal right granted by Shah Alam II to the Company","Diwani of Bengal, Bihar and Orissa","இரண்டாம் ஷா ஆலம் கம்பெனிக்கு வழங்கிய வருவாய் உரிமை","வங்காளம், பீகார், ஒரிசாவின் திவானி உரிமை"),
(265,"meaning","Meaning of Diwani in the chapter","Revenue administration","பாடநூலில் திவானி என்பதன் பொருள்","வருவாய் நிர்வாகம்"),
(265,"district","One district granted to Shah Alam II under Allahabad arrangements","Allahabad","அலகாபாத் ஏற்பாட்டின்படி இரண்டாம் ஷா ஆலமுக்கு வழங்கப்பட்ட மாவட்டம்","அலகாபாத்"),
(265,"district","Another district granted to Shah Alam II","Kora","இரண்டாம் ஷா ஆலமுக்கு வழங்கப்பட்ட மற்றொரு மாவட்டம்","கோரா"),
(265,"allowance","Annual allowance promised to Shah Alam II","Rs. 26 lakhs","இரண்டாம் ஷா ஆலமுக்கு ஆண்டுதோறும் வழங்கப்பட வேண்டிய தொகை","ரூ. 26 லட்சம்"),
(265,"state","Province restored to Shuja-ud-daulah","Oudh","ஷுஜா-உத்-தௌலாவுக்கு மீள வழங்கப்பட்ட மாகாணம்","அவத்"),
(265,"condition","Condition for restoration of Oudh to Shuja-ud-daulah","Payment of war indemnity","அவத் மீள வழங்கப்பட்ட நிபந்தனை","போர் இழப்பீடு செலுத்துதல்"),
(265,"responsibility","Who remained formally responsible for governance of Bengal, Bihar and Orissa","Nawab of Bengal","வங்காளம், பீகார், ஒரிசாவின் நிர்வாகப் பொறுப்பு பெயரளவில் யாரிடம் இருந்தது","வங்காள நவாப்"),
(265,"term","Civil administration transferred to the Company before Diwani grant","Nizamat","திவானி வழங்கப்படுமுன் கம்பெனிக்கு மாற்றப்பட்ட பொது நிர்வாகம்","நிஜாமத்"),
(265,"duty","Main duty of the Diwan","Revenue collection and control of civil justice","திவானின் முக்கிய கடமை","வரி வசூலும் குடிமை நீதியின் கட்டுப்பாடும்"),
(265,"duty","Main function of the Nizam","Military power and criminal justice","நிஜாமின் முக்கியப் பணி","இராணுவ அதிகாரமும் குற்றவியல் நீதியும்"),
(265,"system","Arrangement in which Company held real power while Nawab bore responsibility","Dual System","கம்பெனி உண்மையான அதிகாரம் வைத்தும் நவாப் பொறுப்பு ஏற்ற நிர்வாக முறை","இரட்டை ஆட்சிமுறை"),
(265,"alternate","Another name for Dual System","Double Government or Dyarchy","இரட்டை ஆட்சிமுறையின் மற்றொரு பெயர்","இரட்டை அரசுமுறை அல்லது டையார்க்கி"),
(265,"cause","Governance problem that led to Bengal famine under Dual System","Power without responsibility","இரட்டை ஆட்சியில் வங்காளப் பஞ்சத்துக்கு வழிவகுத்த நிர்வாகக் குறை","பொறுப்பில்லா அதிகாரம்"),
(265,"fraction","Share of Bengal population said to have perished in famine of 1770","Nearly one third","1770 வங்காளப் பஞ்சத்தில் இறந்ததாகக் கூறப்படும் மக்கள்தொகை பங்கு","சுமார் மூன்றில் ஒன்று"),
(265,"abuse","Commodity monopolized by Company servants during Bengal famine","Rice","வங்காளப் பஞ்சத்தில் கம்பெனி ஊழியர்கள் ஏகபோகமாக்கிய பொருள்","அரிசி"),
(265,"act","Act passed after Company accepted responsibility","Regulating Act of 1773","கம்பெனி பொறுப்பை ஏற்ற பின் இயற்றப்பட்ட சட்டம்","1773 ஒழுங்குமுறைச் சட்டம்"),
(265,"person","Official appointed Governor-General of Bengal under Regulating Act","Warren Hastings","ஒழுங்குமுறைச் சட்டத்தின் கீழ் வங்காள கவர்னர் ஜெனரலானவர்","வாரன் ஹேஸ்டிங்ஸ்"),

# Evolution of Governor-General/Viceroy
(265,"period","Administrative head title of East India Company until 1772","Governor","1772 வரை கிழக்கிந்தியக் கம்பெனியின் நிர்வாகத் தலைவரின் பதவி","ஆளுநர்"),
(265,"fort","One fort whose Governor could be Company administrative head","Fort William","கம்பெனி நிர்வாகத் தலைவர் அமர்ந்த கோட்டைகளில் ஒன்று","வில்லியம் கோட்டை"),
(265,"fort","Another fort whose Governor could be Company administrative head","Fort St. George","கம்பெனி நிர்வாகத் தலைவர் அமர்ந்த மற்றொரு கோட்டை","செயின்ட் ஜார்ஜ் கோட்டை"),
(265,"act","Act that made Warren Hastings Governor-General of Bengal","Regulating Act of 1773","வாரன் ஹேஸ்டிங்ஸை வங்காள கவர்னர் ஜெனரலாக்கிய சட்டம்","1773 ஒழுங்குமுறைச் சட்டம்"),
(265,"act","Act that redesignated the post as Governor-General of India","Charter Act of 1833","பதவியை இந்திய கவர்னர் ஜெனரல் என மாற்றிய சட்டம்","1833 பட்டயச் சட்டம்"),
(265,"person","First Governor-General of united British India","William Bentinck","ஒருங்கிணைந்த பிரிட்டிஷ் இந்தியாவின் முதல் கவர்னர் ஜெனரல்","வில்லியம் பெண்டிங்"),
(265,"body","Body selecting the Governor-General before Crown rule","Court of Directors of the East India Company","கிரௌன் ஆட்சிக்கு முன் கவர்னர் ஜெனரலைத் தேர்ந்தெடுத்த அமைப்பு","கிழக்கிந்தியக் கம்பெனியின் இயக்குநர் மன்றம்"),
(265,"date","Year title Viceroy and Governor-General first used in Queen's Proclamation","1858","ராணியின் பிரகடனத்தில் வைஸ்ராய் மற்றும் கவர்னர் ஜெனரல் என்ற பட்டம் முதலில் பயன்படுத்தப்பட்ட ஆண்டு","1858"),
(265,"person","First Viceroy and Governor-General accountable to British Parliament","Canning","பிரிட்டிஷ் நாடாளுமன்றத்திற்குப் பொறுப்பான முதல் வைஸ்ராய் மற்றும் கவர்னர் ஜெனரல்","கானிங்"),

# Revenue administration
(265,"act","Act imposing legal obligation to report revenue transactions to British Treasury","Regulating Act of 1773","வருவாய் பரிவர்த்தனைகளை பிரிட்டிஷ் கருவூலத்திற்கு தெரிவிக்க சட்டப்பொறுப்பு விதித்த சட்டம்","1773 ஒழுங்குமுறைச் சட்டம்"),
(265,"body","Body consisting of Governor, Commander-in-Chief and two counsellors for revenue matters","Board of Revenue","ஆளுநர், தலைமைத் தளபதி, இரு ஆலோசகர்கள் கொண்ட வருவாய் அமைப்பு","வருவாய் வாரியம்"),
(265,"act","Act separating civil and military establishments in India","Pitt India Act of 1784","குடிமை மற்றும் இராணுவ அமைப்புகளைப் பிரித்த சட்டம்","1784 பிட் இந்தியச் சட்டம்"),
(265,"person","Governor-General who wanted British-model landlords in India","Cornwallis","பிரிட்டிஷ் மாதிரி நிலப்பிரபுக்களை இந்தியாவில் உருவாக்க நினைத்த கவர்னர் ஜெனரல்","காரன்வாலிஸ்"),
(265,"background","Personal background of Cornwallis relevant to land policy","A big landlord","நிலக் கொள்கைக்கு தொடர்புடைய காரன்வாலிஸின் தனிப்பட்ட பின்னணி","பெரிய நிலச்சுவாந்தாரர்"),
(265,"class","New middlemen created by Cornwallis settlement","Zamindars","காரன்வாலிஸ் நில ஒப்பந்தம் உருவாக்கிய இடைத்தரகர்கள்","ஜமீந்தார்கள்"),
(265,"effect","Status to which cultivators were reduced under Permanent Settlement","Mere tenants","நிலையான நிலவரி முறையில் பயிரிடுவோர் மாற்றப்பட்ட நிலை","குத்தகை விவசாயிகள்"),
(266,"date","Year Permanent Settlement was concluded","1793","நிலையான நிலவரி முறை அமல்படுத்தப்பட்ட ஆண்டு","1793"),
(266,"region","One region covered by Permanent Settlement","Bengal","நிலையான நிலவரி முறைக்குட்பட்ட பகுதி","வங்காளம்"),
(266,"region","One region covered by Permanent Settlement","Bihar","நிலையான நிலவரி முறைக்குட்பட்ட பகுதி","பீகார்"),
(266,"region","One region covered by Permanent Settlement","Orissa","நிலையான நிலவரி முறைக்குட்பட்ட பகுதி","ஒரிசா"),
(266,"meaning","Meaning of settlement in Permanent Settlement","Assessment and fixing of land revenue due from each zamindar","நிலையான நிலவரி முறையில் settlement என்பதன் பொருள்","ஒவ்வொரு ஜமீந்தாரும் செலுத்த வேண்டிய நிலவரியை நிர்ணயித்தல்"),
(266,"feature","Nature of revenue demand in Bengal, Bihar and Orissa under Permanent Settlement","Fixed permanently","நிலையான நிலவரி முறையில் வரி நிர்ணயத்தின் தன்மை","நிரந்தரமாக நிர்ணயிக்கப்பட்டது"),
(266,"right","Right acquired by former tax collectors under Permanent Settlement","Hereditary rights over assigned land","நிலையான நிலவரி முறையில் முன்னாள் வரிவசூலிப்போர் பெற்ற உரிமை","வாரிசுரிமை கொண்ட நில உரிமை"),
(266,"profit","What zamindars retained above fixed settlement amount","All excess collections","நிர்ணய வரிக்கு மேலாக வசூலித்த தொகையில் ஜமீந்தார்கள் வைத்துக் கொண்டது","முழு அதிகப்படியான வசூல்"),
(266,"province","Presidency where several land-revenue experiments preceded Ryotwari","Madras Presidency","இரயத்துவாரிக்கு முன் பல நிலவரி சோதனைகள் நடந்த மாகாணம்","சென்னை மாகாணம்"),
(266,"district","Madras district divided into mittahs under Permanent Settlement experiment","Chengalpattu","மிட்டாக்களாகப் பிரிக்கப்பட்ட சென்னை மாகாண மாவட்டம்","செங்கல்பட்டு"),
(266,"district","Madras district divided into mittahs under Permanent Settlement experiment","Salem","மிட்டாக்களாகப் பிரிக்கப்பட்ட சென்னை மாகாண மாவட்டம்","சேலம்"),
(266,"district","Madras district divided into mittahs under Permanent Settlement experiment","Dindigul","மிட்டாக்களாகப் பிரிக்கப்பட்ட சென்னை மாகாண மாவட்டம்","திண்டுக்கல்"),
(266,"method","How mittahs were disposed under Madras Permanent Settlement experiment","Sold to highest bidders","மிட்டாக்கள் வழங்கப்பட்ட முறை","அதிக விலை கூறியவர்களுக்கு ஏலத்தில் வழங்கப்பட்டது"),
(266,"result","Outcome of Madras Permanent Settlement experiment","Most purchasers failed within one or two years","சென்னை நிரந்தர நிலவரி சோதனையின் விளைவு","பல வாங்கியோர் ஓரிரு ஆண்டுகளில் தோல்வியடைந்தனர்"),
(266,"system","Revenue arrangement tried after Madras Permanent Settlement failed","Village Lease system","சென்னை நிரந்தர நிலவரி தோல்விக்குப் பின் முயற்சிக்கப்பட்ட முறை","கிராமக் குத்தகை முறை"),
(266,"duration","Period for which village assessment was fixed under Village Lease system","Three years","கிராமக் குத்தகை முறையில் வரி நிர்ணயிக்கப்பட்ட காலம்","மூன்று ஆண்டுகள்"),
(266,"basis","Basis for fixing village assessment under Village Lease system","Actual collections over past years","கிராமக் குத்தகை வரி நிர்ணயத்தின் அடிப்படை","முந்தைய ஆண்டுகளின் உண்மையான வசூல்"),
(266,"office","Person responsible for rent collection where mirasi rights existed","Mirasdar","மிராசி உரிமை இருந்த இடங்களில் வரி வசூல் பொறுப்பாளர்","மிராசுதார்"),
(266,"office","Person responsible where mirasi rights did not exist","Village headman","மிராசி உரிமை இல்லாத பகுதிகளில் பொறுப்பாளர்","கிராமத் தலைவர்"),
(266,"cause","One cause of failure of Village Lease system","Bad monsoons","கிராமக் குத்தகை முறையின் தோல்விக்கான காரணம்","மோசமான பருவமழை"),
(266,"cause","One cause of failure of Village Lease system","Low grain prices","கிராமக் குத்தகை முறையின் தோல்விக்கான காரணம்","குறைந்த தானிய விலை"),
(266,"cause","One cause of failure of Village Lease system","Short lease period","கிராமக் குத்தகை முறையின் தோல்விக்கான காரணம்","குறைந்த குத்தகைக் காலம்"),
(266,"date","Year Court of Directors decided to introduce Ryotwari","1814","இரயத்துவாரி முறையை அறிமுகப்படுத்த இயக்குநர் மன்றம் முடிவு செய்த ஆண்டு","1814"),
(266,"person","Governor who formulated Ryotwari system","Thomas Munro","இரயத்துவாரி முறையை வடிவமைத்த ஆளுநர்","தாமஸ் மன்றோ"),
(266,"term","Anglicized term derived from Arabic ra'iyah","Ryot","அரபு ra'iyah என்பதிலிருந்து ஆங்கிலப்படுத்தப்பட்ட சொல்","ரயத்"),
(266,"meaning","Meaning of Ryot","Peasant or cultivator","ரயத் என்ற சொல்லின் பொருள்","உழவர் அல்லது பயிரிடுபவர்"),
(266,"feature","Core administrative principle of Ryotwari","Direct settlement between government and cultivator","இரயத்துவாரி முறையின் அடிப்படை நிர்வாகக் கொள்கை","அரசும் பயிரிடுபவரும் நேரடியாக ஒப்பந்தம் செய்வது"),
(266,"right","Condition for cultivator retaining possession under Ryotwari","Payment of land revenue","இரயத்துவாரியில் நிலத்தை வைத்திருக்க வேண்டிய நிபந்தனை","நிலவரி செலுத்துதல்"),
(266,"penalty","One penalty for default under Ryotwari","Eviction","இரயத்துவாரியில் வரி செலுத்தாததற்கான தண்டனை","நிலத்திலிருந்து வெளியேற்றம்"),
(266,"penalty","Property that could be attached for Ryotwari default","Livestock","இரயத்துவாரி வரி பாக்கிக்காக பறிமுதல் செய்யக்கூடிய சொத்து","கால்நடை"),
(266,"penalty","Property that could be attached for Ryotwari default","Household property","இரயத்துவாரி வரி பாக்கிக்காக பறிமுதல் செய்யக்கூடிய சொத்து","வீட்டு உடைமை"),
(266,"assessment","Unit assessed for revenue under Ryotwari","Each cultivated field","இரயத்துவாரியில் வரி மதிப்பீட்டுக்குட்பட்ட அலகு","ஒவ்வொரு பயிரிடப்பட்ட வயல்"),
(266,"cycle","Interval for Ryotwari revenue reassessment","Thirty years","இரயத்துவாரி வரி மறுமதிப்பீட்டு இடைவெளி","முப்பது ஆண்டுகள்"),
(266,"factor","One factor in Ryotwari reassessment","Grain prices","இரயத்துவாரி மறுமதிப்பீட்டின் ஒரு காரணி","தானிய விலை"),
(266,"factor","One factor in Ryotwari reassessment","Marketing opportunities","இரயத்துவாரி மறுமதிப்பீட்டின் ஒரு காரணி","சந்தைப்படுத்தும் வாய்ப்புகள்"),
(266,"factor","One factor in Ryotwari reassessment","Irrigation facilities","இரயத்துவாரி மறுமதிப்பீட்டின் ஒரு காரணி","பாசன வசதிகள்"),
(267,"concept","Land concept introduced by Ryotwari system","Private property in land","இரயத்துவாரி முறையால் அறிமுகமான நிலக் கருத்து","நிலத்தில் தனியுடைமை"),
(267,"document","Document issued to individual landholders under Ryotwari","Patta","இரயத்துவாரியில் தனிநில உரிமையாளருக்கு வழங்கப்பட்ட ஆவணம்","பட்டா"),
(267,"right","One right of Ryotwari holder","Sell land","இரயத்துவாரி நில உரிமையாளரின் ஒரு உரிமை","நிலத்தை விற்பது"),
(267,"right","One right of Ryotwari holder","Lease land","இரயத்துவாரி நில உரிமையாளரின் ஒரு உரிமை","நிலத்தை குத்தகைக்கு விடுதல்"),
(267,"right","One right of Ryotwari holder","Mortgage land","இரயத்துவாரி நில உரிமையாளரின் ஒரு உரிமை","நிலத்தை அடமானம் வைப்பது"),
(267,"system","Revenue system introduced in 1833 under William Bentinck","Mahalwari system","1833இல் வில்லியம் பெண்டிங் காலத்தில் அறிமுகமான வருவாய் முறை","மகல்வாரி முறை"),
(267,"feature","Who made revenue settlement under Mahalwari","Proprietor of the estate","மகல்வாரி முறையில் வருவாய் ஒப்பந்தம் யாருடன் செய்யப்பட்டது","நில உரிமையாளர்"),
(267,"feature","From whom land revenue was collected under Mahalwari","Individual cultivators","மகல்வாரி முறையில் நிலவரி யாரிடமிருந்து வசூலிக்கப்பட்டது","தனிப்பட்ட பயிரிடுவோர்"),

# Thomas Munro
(266,"date","Year Thomas Munro arrived in Madras","1780","தாமஸ் மன்றோ மதராஸ் வந்த ஆண்டு","1780"),
(266,"duration","Munro's first period spent as soldier in Mysore War","Twelve years","மைசூர் போரில் வீரராக மன்றோ இருந்த ஆரம்ப காலம்","பன்னிரண்டு ஆண்டுகள்"),
(266,"region","Region where Munro worked from 1792 to 1799","Baramahal (Salem district)","1792–1799 மன்றோ பணியாற்றிய பகுதி","பாரமஹால் (சேலம் மாவட்டம்)"),
(266,"region","Region where Munro worked from 1799 to 1800","Kanara","1799–1800 மன்றோ பணியாற்றிய பகுதி","கனரா"),
(266,"district","One Ceded District for which Munro served as collector","Kadapa","மன்றோ ஆட்சியராக இருந்த பிரித்தெடுக்கப்பட்ட மாவட்டம்","கடப்பா"),
(266,"district","One Ceded District for which Munro served as collector","Kurnool","மன்றோ ஆட்சியராக இருந்த பிரித்தெடுக்கப்பட்ட மாவட்டம்","கர்னூல்"),
(266,"district","One Ceded District for which Munro served as collector","Chittoor","மன்றோ ஆட்சியராக இருந்த பிரித்தெடுக்கப்பட்ட மாவட்டம்","சித்தூர்"),
(266,"district","One Ceded District for which Munro served as collector","Anantapur","மன்றோ ஆட்சியராக இருந்த பிரித்தெடுக்கப்பட்ட மாவட்டம்","அனந்தபூர்"),
(266,"date","Year Munro became Governor of Madras Presidency","1820","மன்றோ சென்னை மாகாண ஆளுநரான ஆண்டு","1820"),
(266,"duration","Length of Munro's service as Madras Governor","Seven years","சென்னை ஆளுநராக மன்றோ பணியாற்றிய காலம்","ஏழு ஆண்டுகள்"),
(266,"date","Year Munro officially enforced Ryotwari in Madras","1822","மன்றோ இரயத்துவாரியை சென்னை மாகாணத்தில் அதிகாரப்பூர்வமாக அமல்படுத்திய ஆண்டு","1822"),
(266,"policy","Public field Munro regarded expenditure on as investment","Education","செலவை முதலீடாக மன்றோ கருதிய பொதுத்துறை","கல்வி"),
(266,"policy","Service reform emphasized by Munro","Indianization of services","மன்றோ வலியுறுத்திய பணியாளர் சீர்திருத்தம்","பணிகளின் இந்தியமயமாக்கல்"),
(266,"place","Place where Munro died of cholera","Pattikonda in Kurnool district","மன்றோ காலராவால் இறந்த இடம்","கர்னூல் மாவட்ட பட்டிகொண்டா"),
(266,"date","Month and year of Munro's death","July 1827","மன்றோ இறந்த மாதம் மற்றும் ஆண்டு","ஜூலை 1827"),
(266,"date","Year Munro's statue was erected at Madras","1839","மதராஸில் மன்றோ சிலை நிறுவப்பட்ட ஆண்டு","1839"),
(266,"funding","How Munro's Madras statue was financed","Public subscription","மன்றோ சிலைக்கான நிதி திரட்டப்பட்ட முறை","பொது நன்கொடை"),

# Subsidiary Alliance
(267,"period","Governor-Generalship of Wellesley","1798–1805","வெல்லெஸ்லியின் கவர்னர் ஜெனரல் காலம்","1798–1805"),
(267,"policy","Broad policy pursued by Wellesley","Forward policy for British supremacy","வெல்லெஸ்லி பின்பற்றிய பரந்த கொள்கை","பிரிட்டிஷ் மேலாதிக்கத்திற்கான முன்னோக்குக் கொள்கை"),
(267,"method","Wellesley's annexation method described in chapter","Assumption of administration while ruler retained title and allowance","வெல்லெஸ்லியின் இணைப்பு முறை","அரசர் பட்டமும் மானியமும் வைத்திருக்க நிர்வாகத்தை கம்பெனி கைப்பற்றுதல்"),
(267,"state","State receiving British contingent subsidy before Wellesley","Hyderabad Nizam","வெல்லெஸ்லிக்கு முன் பிரிட்டிஷ் படைப் பராமரிப்பு மானியம் பெற்ற அரசு","ஹைதராபாத் நிஜாம்"),
(267,"state","State receiving British contingent subsidy before Wellesley","Nawab of Oudh","வெல்லெஸ்லிக்கு முன் பிரிட்டிஷ் படைப் பராமரிப்பு மானியம் பெற்ற அரசு","அவத் நவாப்"),
(267,"payment","Usual form of payment for British contingents before Wellesley","Cash","வெல்லெஸ்லிக்கு முன் பிரிட்டிஷ் படைகளுக்கான கட்டண முறை","பணம்"),
(267,"system","Arrangement expanded by Wellesley","Subsidiary Alliance System","வெல்லெஸ்லி விரிவாக்கிய ஏற்பாடு","துணைப்படைத் திட்டம்"),
(267,"state","One state brought under Subsidiary Alliance","Hyderabad","துணைப்படைத் திட்டத்தில் கொண்டுவரப்பட்ட அரசு","ஹைதராபாத்"),
(267,"state","One state brought under Subsidiary Alliance","Mysore","துணைப்படைத் திட்டத்தில் கொண்டுவரப்பட்ட அரசு","மைசூர்"),
(267,"state","One state brought under Subsidiary Alliance","Lucknow","துணைப்படைத் திட்டத்தில் கொண்டுவரப்பட்ட அரசு","லக்னோ"),
(267,"state","One Maratha authority brought under Subsidiary Alliance","Maratha Peshwa","துணைப்படைத் திட்டத்தில் கொண்டுவரப்பட்ட மராத்திய அதிகாரம்","மராத்திய பேஷ்வா"),
(267,"state","Maratha house listed under Subsidiary Alliance","Bhonsle (Kolhapur)","துணைப்படைத் திட்டத்தில் பட்டியலிடப்பட்ட மராத்திய வீடு","போன்ஸ்லே (கோலாப்பூர்)"),
(267,"state","Maratha house listed under Subsidiary Alliance","Sindhia (Gwalior)","துணைப்படைத் திட்டத்தில் பட்டியலிடப்பட்ட மராத்திய வீடு","சிந்தியா (குவாலியர்)"),
(267,"provision","Military obligation of ruler joining Subsidiary Alliance","Dissolve own armed forces and accept British forces","துணைப்படைத் திட்டத்தில் சேர்ந்த அரசரின் இராணுவப் பொறுப்பு","சொந்தப் படையை கலைத்து பிரிட்டிஷ் படையை ஏற்றுக்கொள்வது"),
(267,"office","British official required in allied ruler's territory","British Resident","துணைப்படைத் திட்ட அரசில் இருக்க வேண்டிய பிரிட்டிஷ் அதிகாரி","பிரிட்டிஷ் ரெசிடெண்ட்"),
(267,"provision","Financial obligation under Subsidiary Alliance","Pay maintenance of British army","துணைப்படைத் திட்டத்தின் நிதிப் பொறுப்பு","பிரிட்டிஷ் படைப் பராமரிப்பு செலவை ஏற்றல்"),
(267,"penalty","Penalty for failure to pay army maintenance","Cede a portion of territory","படை பராமரிப்பு செலவைச் செலுத்தத் தவறியதற்கான தண்டனை","ஒரு பகுதி நிலத்தை ஒப்படைத்தல்"),
(267,"provision","European connection allied ruler had especially to sever","French","துணைப்படை அரசர் குறிப்பாகத் துண்டிக்க வேண்டிய ஐரோப்பிய தொடர்பு","பிரெஞ்சு தொடர்பு"),
(267,"provision","Employment restriction under Subsidiary Alliance","No European without British permission","துணைப்படைத் திட்டத்தின் பணியமர்த்தல் தடை","பிரிட்டிஷ் அனுமதியின்றி ஐரோப்பியரை பணியமர்த்தக்கூடாது"),
(267,"provision","Diplomatic restriction under Subsidiary Alliance","No negotiation with Indian power without Company permission","துணைப்படைத் திட்டத்தின் தூதரகத் தடை","கம்பெனி அனுமதியின்றி இந்திய அரசுடன் பேச்சுவார்த்தை நடத்தக்கூடாது"),
(267,"effect","Political consequence for states under Subsidiary Alliance","Loss of sovereignty and dependence on Company","துணைப்படைத் திட்டத்தின் அரசியல் விளைவு","இறையாண்மை இழந்து கம்பெனியை சார்ந்த நிலை"),
(267,"effect","Military result for Company under Subsidiary System","Increased military resources and efficiency","துணைப்படைத் திட்டத்தால் கம்பெனிக்கு ஏற்பட்ட இராணுவ விளைவு","இராணுவ வளமும் திறனும் அதிகரித்தது"),
(267,"effect","Immediate social-military result of Subsidiary System","Discharge of thousands of professional soldiers","துணைப்படைத் திட்டத்தின் உடனடி சமூக-இராணுவ விளைவு","ஆயிரக்கணக்கான தொழில்முறை வீரர்கள் வேலை இழந்தனர்"),
(267,"group","Marauder bands whose numbers swelled after disbandment of soldiers","Pindaris","படை கலைப்பால் அதிகரித்த கொள்ளைக் குழுக்கள்","பிண்டாரிகள்"),
(267,"effect","Administrative tendency of protected states under guaranteed support","Maladministration","உறுதி செய்யப்பட்ட பாதுகாப்பின் கீழ் சுதேச அரசுகளில் ஏற்பட்ட நிர்வாகப் போக்கு","மோசமான நிர்வாகம்"),
(267,"meaning","British use of term Presidency","Place where office of Chief Administrative Head was situated","பிரிட்டிஷாரின் Presidency என்ற சொல்லின் பொருள்","தலைமை நிர்வாக அலுவலகம் அமைந்த இடம்"),
(267,"presidency","One of three Presidencies","Madras","மூன்று பிரெசிடென்சிகளில் ஒன்று","மதராஸ்"),
(267,"presidency","One of three Presidencies","Bombay","மூன்று பிரெசிடென்சிகளில் ஒன்று","பம்பாய்"),
(267,"presidency","One of three Presidencies","Calcutta","மூன்று பிரெசிடென்சிகளில் ஒன்று","கல்கத்தா"),
(267,"province","One later province created for easier governance","Central Provinces","நிர்வாக வசதிக்காக உருவாக்கப்பட்ட பிற்கால மாகாணம்","மத்திய மாகாணங்கள்"),
(267,"province","One later province created for easier governance","United Provinces","நிர்வாக வசதிக்காக உருவாக்கப்பட்ட பிற்கால மாகாணம்","ஐக்கிய மாகாணங்கள்"),

# Doctrine of Lapse
(267,"custom","Hindu custom recognized in absence of male heir","Adoption of a son","ஆண் வாரிசு இல்லாதபோது அங்கீகரிக்கப்பட்ட இந்து வழக்கம்","மகனைத் தத்தெடுத்தல்"),
(267,"right","Traditional right of adopted son","Inherit property","தத்தெடுக்கப்பட்ட மகனின் பாரம்பரிய உரிமை","சொத்து வாரிசுரிமை"),
(267,"person","Governor-General who formulated Doctrine of Lapse policy","Dalhousie","வாரிசு உரிமை இழப்புக் கொள்கையை செயல்படுத்திய கவர்னர் ஜெனரல்","டல்ஹௌசி"),
(267,"principle","Dalhousie's legal position on adoption in dependent states","Paramount power could refuse sanction","சார்பு அரசுகளில் தத்தெடுப்பை குறித்து டல்ஹௌசியின் நிலை","மேலாதிக்க அரசு ஒப்புதல் மறுக்கலாம்"),
(267,"effect","Result if adoption was not sanctioned under Doctrine of Lapse","State lapsed to paramount power","தத்தெடுப்பு அங்கீகரிக்கப்படாவிட்டால் வாரிசு உரிமை இழப்புக் கொள்கையின் விளைவு","அரசு மேலாதிக்க ஆட்சியுடன் இணைந்ததாகக் கருதப்பட்டது"),
(268,"state","First state annexed under Doctrine of Lapse","Satara","வாரிசு உரிமை இழப்புக் கொள்கையில் முதலில் இணைக்கப்பட்ட அரசு","சதாரா"),
(268,"person","Satara ruler whose adopted son was not recognised","Shahji","தத்துப்புதல்வர் அங்கீகரிக்கப்படாத சதாரா அரசர்","ஷாஜி"),
(268,"date","Year Shahji of Satara died","1848","சதாரா ஷாஜி இறந்த ஆண்டு","1848"),
(268,"state","State annexed after death of Gangadhar Rao","Jhansi","கங்காதர் ராவ் இறந்த பின் இணைக்கப்பட்ட அரசு","ஜான்சி"),
(268,"person","Raja of Jhansi who died in November 1853","Gangadhar Rao","நவம்பர் 1853இல் இறந்த ஜான்சி ராஜா","கங்காதர் ராவ்"),
(268,"date","Month and year of Gangadhar Rao's death","November 1853","கங்காதர் ராவ் இறந்த மாதம் மற்றும் ஆண்டு","நவம்பர் 1853"),
(268,"person","Widow of Gangadhar Rao prominent in Revolt of 1857","Rani Lakshmi Bai","1857 கிளர்ச்சியில் முக்கிய பங்கு வகித்த கங்காதர் ராவின் விதவை","ராணி லட்சுமிபாய்"),
(268,"person","Nagpur ruler who died without a child in 1853","Raghuji Bhonsle III","1853இல் வாரிசின்றி இறந்த நாக்பூர் அரசர்","மூன்றாம் ரகுஜி போன்ஸ்லே"),
(268,"state","State annexed after Raghuji Bhonsle III died","Nagpur","மூன்றாம் ரகுஜி போன்ஸ்லே இறந்த பின் இணைக்கப்பட்ட அரசு","நாக்பூர்"),
(268,"date","Year last Peshwa died","1851","கடைசி பேஷ்வா இறந்த ஆண்டு","1851"),
(268,"duration","Years the last Peshwa had been Company pensioner","Thirty-three years","கடைசி பேஷ்வா கம்பெனி ஓய்வூதியம் பெற்றிருந்த காலம்","முப்பத்துமூன்று ஆண்டுகள்"),
(268,"person","Son of last Peshwa whose pension Dalhousie refused to continue","Nana Sahib","கடைசி பேஷ்வாவின் மகனாக ஓய்வூதியம் மறுக்கப்பட்டவர்","நானா சாஹிப்"),
(268,"date","Year Doctrine of Lapse was withdrawn","1858","வாரிசு உரிமை இழப்புக் கொள்கை திரும்பப் பெறப்பட்ட ஆண்டு","1858"),
(268,"event","Political change accompanying withdrawal of Doctrine of Lapse","Crown took over India","வாரிசு உரிமை இழப்புக் கொள்கை திரும்பப் பெறப்பட்டபோது நடந்த அரசியல் மாற்றம்","இந்தியா பிரிட்டிஷ் கிரௌன் கட்டுப்பாட்டுக்கு வந்தது"),

# Paramountcy and native states
(268,"battle","Battle after which Company began its expansionary career with dual government","Plassey","கம்பெனி விரிவாக்கப் பயணத்தை இரட்டை ஆட்சியுடன் தொடங்கிய பின் நடந்த முக்கியப் போர்","பிளாசி"),
(268,"theory","Company's formal claim under dual government","Only the Diwan or revenue collector","இரட்டை ஆட்சியில் கம்பெனியின் பெயரளவு நிலை","திவான் அல்லது வரி வசூலிப்பவர் மட்டும்"),
(268,"practice","Company's actual position under dual government","Exercised full authority","இரட்டை ஆட்சியில் கம்பெனியின் உண்மையான நிலை","முழு அதிகாரம் செலுத்தியது"),
(268,"emperor","Mughal emperor whose promised tribute Company stopped paying","Shah Alam II","கம்பெனி வருடாந்திர கப்பம் செலுத்துவதை நிறுத்திய முகலாய பேரரசர்","இரண்டாம் ஷா ஆலம்"),
(268,"person","Governor-General who stopped affirming obedience in letters to Mughal emperor","Cornwallis","முகலாய பேரரசருக்கு கடிதங்களில் கீழ்ப்படிதலை ஒப்புக்கொள்வதை நிறுத்தியவர்","காரன்வாலிஸ்"),
(268,"person","Governor-General who deepened British predominance through Subsidiary Alliance","Wellesley","துணைப்படைத் திட்டத்தின் மூலம் பிரிட்டிஷ் மேலாதிக்கத்தை ஆழப்படுத்தியவர்","வெல்லெஸ்லி"),
(268,"state","One major state with which Wellesley made subsidiary alliance","Hyderabad","வெல்லெஸ்லி துணைப்படை உடன்படிக்கை செய்த முக்கிய அரசு","ஹைதராபாத்"),
(268,"state","One major state with which Wellesley made subsidiary alliance","Poona","வெல்லெஸ்லி துணைப்படை உடன்படிக்கை செய்த முக்கிய அரசு","பூனா"),
(268,"state","One major state with which Wellesley made subsidiary alliance","Mysore","வெல்லெஸ்லி துணைப்படை உடன்படிக்கை செய்த முக்கிய அரசு","மைசூர்"),
(268,"person","Governor-General known as Hastings (Moira) who assumed office in 1813","Lord Hastings","1813இல் பதவியேற்ற ஹேஸ்டிங்ஸ் (மொய்ரா)","லார்ட் ஹேஸ்டிங்ஸ்"),
(268,"date","Year Hastings (Moira) became Governor-General","1813","ஹேஸ்டிங்ஸ் (மொய்ரா) கவர்னர் ஜெனரலான ஆண்டு","1813"),
(268,"symbol","Imperial claim removed by Hastings from his seal","Phrase denoting Mughal imperial supremacy","ஹேஸ்டிங்ஸ் தனது முத்திரையிலிருந்து நீக்கிய பேரரசு குறிப்பு","முகலாய பேரரசு மேலாதிக்கத்தைக் குறிக்கும் சொற்றொடர்"),
(268,"emperor","Mughal emperor Hastings refused to meet unless authority was waived","Akbar II","அதிகாரத்தை கைவிடாவிட்டால் சந்திக்க மறுத்த முகலாய பேரரசர்","இரண்டாம் அக்பர்"),
(268,"policy","Hastings' stated policy regarding administration of Indian States","Company was not responsible for their administration","இந்திய சுதேச அரசுகள் குறித்து ஹேஸ்டிங்ஸின் கொள்கை","அவற்றின் நிர்வாகத்திற்கு கம்பெனி பொறுப்பில்லை"),
(268,"region","Region of many petty chiefs requiring close Company supervision","Kathiawar","பல சிற்றரசர்கள் இருந்ததால் கம்பெனி நெருங்கிய கண்காணிப்பு தேவைப்பட்ட பகுதி","கத்தியாவார்"),
(268,"region","Another region of many petty chiefs requiring supervision","Central India","பல சிற்றரசர்கள் இருந்ததால் கம்பெனி கண்காணிப்பு தேவைப்பட்ட பகுதி","மத்திய இந்தியா"),
(268,"state","State where British troops subdued uncontrolled Arab troops","Hyderabad","கட்டுப்பாடற்ற அரபு படைகளை பிரிட்டிஷ் படைகள் அடக்கிய அரசு","ஹைதராபாத்"),
(268,"date","Year rebellion in Mysore was provoked by Raja's financial management","1830","மைசூர் ராஜாவின் நிதி நிர்வாகத்தால் கிளர்ச்சி ஏற்பட்ட ஆண்டு","1830"),
(268,"person","Governor-General who relieved Mysore Raja of powers","William Bentinck","மைசூர் ராஜாவின் அதிகாரங்களை நீக்கிய கவர்னர் ஜெனரல்","வில்லியம் பெண்டிங்"),
(268,"person","Administrator appointed by Bentinck to govern Mysore","Mark Cubbon","மைசூரை நிர்வகிக்க பெண்டிங் நியமித்தவர்","மார்க் கப்பன்"),
(268,"state","State where minority and durbar quarrels led to Company intervention","Gwalior","சிறுவயது ஆட்சியும் அரண்மனை சச்சரவுகளும் கம்பெனி தலையீட்டிற்கு வழிவகுத்த அரசு","குவாலியர்"),
(268,"person","Governor-General who moved with strong army against Gwalior disorder","Ellenborough","குவாலியர் குழப்பத்திற்கு எதிராக பெரிய படையுடன் நகர்ந்த கவர்னர் ஜெனரல்","எலன்பரோ"),
(268,"battle","Battle where Gwalior state army was defeated","Battle of Maharajpur","குவாலியர் அரசுப் படை தோற்கடிக்கப்பட்ட போர்","மகராஜ்பூர் போர்"),
(268,"date","Year new military limitations were imposed on Gwalior","1843","குவாலியர் மீது புதிய இராணுவக் கட்டுப்பாடுகள் விதிக்கப்பட்ட ஆண்டு","1843"),

# Civil, judicial and police reforms
(268,"person","Orientalist judge whose services Cornwallis secured","William Jones","காரன்வாலிஸ் சேவையைப் பயன்படுத்திய ஓரியண்டலிஸ்ட் நீதிபதி","வில்லியம் ஜோன்ஸ்"),
(268,"reform","Administrative separation introduced by Cornwallis","Revenue collection separated from administration and justice","காரன்வாலிஸ் அறிமுகப்படுத்திய நிர்வாகப் பிரிவு","வருவாய் வசூலை நிர்வாகம் மற்றும் நீதியிலிருந்து பிரித்தல்"),
(269,"office","Function removed from Collectors by Cornwallis","Judicial function","காரன்வாலிஸ் ஆட்சியர்களிடமிருந்து நீக்கிய பணி","நீதித்துறைப் பணி"),
(269,"court","Highest civil court of appeal under Cornwallis system","Sadar Diwani Adalat","காரன்வாலிஸ் முறையில் உயர்ந்த குடிமை மேல்முறையீட்டு நீதிமன்றம்","சதர் திவானி அதாலத்"),
(269,"court","Highest criminal court of appeal under Cornwallis system","Sadar Nizamat Adalat","காரன்வாலிஸ் முறையில் உயர்ந்த குற்றவியல் மேல்முறையீட்டு நீதிமன்றம்","சதர் நிஜாமத் அதாலத்"),
(269,"place","Location of highest civil and criminal appeal courts","Calcutta","உயர்ந்த குடிமை மற்றும் குற்றவியல் மேல்முறையீட்டு நீதிமன்றங்கள் இருந்த இடம்","கல்கத்தா"),
(269,"presiding","Authority presiding over Sadar courts","Governor-General and Council","சதர் நீதிமன்றங்களைத் தலைமை தாங்கிய அதிகாரம்","கவர்னர் ஜெனரலும் கவுன்சிலும்"),
(269,"number","Number of provincial courts of appeal below Sadar courts","Four","சதர் நீதிமன்றங்களுக்குக் கீழ் இருந்த மாகாண மேல்முறையீட்டு நீதிமன்றங்கள்","நான்கு"),
(269,"place","One provincial court of appeal location","Calcutta","மாகாண மேல்முறையீட்டு நீதிமன்றம் இருந்த இடம்","கல்கத்தா"),
(269,"place","One provincial court of appeal location","Deccan","மாகாண மேல்முறையீட்டு நீதிமன்றம் இருந்த இடம்","தக்காணம்"),
(269,"place","One provincial court of appeal location","Murshidabad","மாகாண மேல்முறையீட்டு நீதிமன்றம் இருந்த இடம்","முர்ஷிதாபாத்"),
(269,"place","One provincial court of appeal location","Patna","மாகாண மேல்முறையீட்டு நீதிமன்றம் இருந்த இடம்","பாட்னா"),
(269,"number","European judges in each provincial appeal court","Three","ஒவ்வொரு மாகாண மேல்முறையீட்டு நீதிமன்றத்திலும் இருந்த ஐரோப்பிய நீதிபதிகள்","மூன்று"),
(269,"court","Courts below provincial appeal courts","District and City courts","மாகாண மேல்முறையீட்டு நீதிமன்றங்களுக்கு கீழிருந்த நீதிமன்றங்கள்","மாவட்ட மற்றும் நகர நீதிமன்றங்கள்"),
(269,"judge","Indian judges at bottom of judicial hierarchy","Munsifs","நீதித்துறை அமைப்பின் அடித்தளத்தில் இருந்த இந்திய நீதிபதிகள்","முன்சீப்கள்"),
(269,"law","Law stated to be followed in civil cases","Muslim law","குடிமை வழக்குகளில் பின்பற்றப்பட்டதாக பாடநூல் கூறும் சட்டம்","முஸ்லிம் சட்டம்"),
(269,"law","Basis for law in criminal cases","Hindu or Muslim law according to litigants' religion","குற்றவியல் வழக்குகளில் சட்டத்தின் அடிப்படை","வழக்காளர்களின் மதத்திற்கேற்ப இந்து அல்லது முஸ்லிம் சட்டம்"),
(269,"reform","Cornwallis's biggest contribution according to chapter","Reform of civil services","பாடநூலின்படி காரன்வாலிஸின் மிகப்பெரிய பங்களிப்பு","குடிமைப் பணிச் சீர்திருத்தம்"),
(269,"policy","Old civil-service practice ended by Cornwallis","Small salary plus permission for private trade","காரன்வாலிஸ் முடித்த பழைய குடிமைப் பணி நடைமுறை","குறைந்த ஊதியத்துடன் தனியார் வாணிப அனுமதி"),
(269,"criterion","Basis on which Cornwallis appointed officials","Merit","காரன்வாலிஸ் அதிகாரிகளை நியமித்த அடிப்படை","தகுதி"),
(269,"exclusion","Group excluded from Company service under Cornwallis efficiency policy","Indians","காரன்வாலிஸ் கொள்கையில் கம்பெனி பணியிலிருந்து விலக்கப்பட்டோர்","இந்தியர்கள்"),
(269,"unit","Police circle in a district","Thana","மாவட்டத்தின் காவல் வட்டம்","தானா"),
(269,"office","Indian officer heading a thana","Daroga","தானாவைத் தலைமை தாங்கிய இந்திய அதிகாரி","தரோகா"),
(269,"reform","Later change in separation of judicial and revenue powers","Collector also functioned as Magistrate","நீதி-வருவாய் பிரிவில் பிற்கால மாற்றம்","ஆட்சியர் மாஜிஸ்திரேட்டாகவும் செயல்பட்டார்"),

# Training of Company servants
(269,"person","Governor-General emphasizing education and training of Company civilians","Wellesley","கம்பெனி குடிமைப் பணியாளர்களின் கல்வி மற்றும் பயிற்சியை வலியுறுத்தியவர்","வெல்லெஸ்லி"),
(269,"knowledge","One field Wellesley wanted civilians to know","Indian languages","கம்பெனி குடிமைப் பணியாளர்கள் அறிய வேண்டும் என வெல்லெஸ்லி விரும்பிய துறை","இந்திய மொழிகள்"),
(269,"knowledge","One field Wellesley wanted civilians to know","Indian laws","வெல்லெஸ்லி வலியுறுத்திய அறிவுத் துறை","இந்திய சட்டங்கள்"),
(269,"knowledge","One field Wellesley wanted civilians to know","Indian customs and manners","வெல்லெஸ்லி வலியுறுத்திய அறிவுத் துறை","இந்திய பழக்கவழக்கங்கள்"),
(269,"college","College founded at Calcutta in 1800 for Company civil servants","College of Fort William","1800இல் கம்பெனி குடிமைப் பணியாளர்களுக்காக கல்கத்தாவில் நிறுவப்பட்ட கல்லூரி","வில்லியம் கோட்டைக் கல்லூரி"),
(269,"date","Year College of Fort William was founded","1800","வில்லியம் கோட்டைக் கல்லூரி நிறுவப்பட்ட ஆண்டு","1800"),
(269,"duration","Course duration at College of Fort William","Three years","வில்லியம் கோட்டைக் கல்லூரியின் பாடநெறிக் காலம்","மூன்று ஆண்டுகள்"),
(269,"number","Indian pundits staffing College of Fort William","Eighty","வில்லியம் கோட்டைக் கல்லூரியில் பணியாற்றிய இந்திய பண்டிதர்கள்","எண்பது"),
(269,"role","Institutional character College of Fort William acquired","Oriental School for Bengal civilians","வில்லியம் கோட்டைக் கல்லூரி பெற்ற நிறுவனத் தன்மை","வங்காள குடிமைப் பணியாளர்களுக்கான கிழக்கத்தியப் பள்ளி"),
(269,"college","College established in England in 1806","East India College","1806இல் இங்கிலாந்தில் நிறுவப்பட்ட கல்லூரி","கிழக்கிந்தியக் கல்லூரி"),
(269,"date","Year East India College was established","1806","கிழக்கிந்தியக் கல்லூரி நிறுவப்பட்ட ஆண்டு","1806"),
(269,"person","Founder of College of Fort St George in Madras","F.W. Ellis","சென்னையில் செயின்ட் ஜார்ஜ் கோட்டைக் கல்லூரியை நிறுவியவர்","எப்.டபிள்யூ. எல்லிஸ்"),
(269,"college","Madras college set up in 1812 on Fort William model","College of Fort St George","1812இல் வில்லியம் கோட்டைக் கல்லூரி மாதிரியில் சென்னையில் நிறுவப்பட்ட கல்லூரி","செயின்ட் ஜார்ஜ் கோட்டைக் கல்லூரி"),
(269,"date","Year College of Fort St George was established","1812","செயின்ட் ஜார்ஜ் கோட்டைக் கல்லூரி நிறுவப்பட்ட ஆண்டு","1812"),
(269,"theory","Linguistic theory formulated at College of Fort St George","South Indian languages form a family independent of Sanskrit","செயின்ட் ஜார்ஜ் கோட்டைக் கல்லூரியில் உருவான மொழியியல் கருத்து","தென்னிந்திய மொழிகள் சமஸ்கிருதத்திலிருந்து தனித்த மொழிக் குடும்பம்"),

# Education
(269,"person","Governor-General supporting establishment of a Madrasa by a learned maulvi","Warren Hastings","ஒரு மௌல்வியின் மதரசா நிறுவுதலை ஆதரித்த கவர்னர் ஜெனரல்","வாரன் ஹேஸ்டிங்ஸ்"),
(269,"number","Stipendiary students with whom the Madrasa began","Forty","மதரசா தொடங்கியபோது உதவித்தொகை பெற்ற மாணவர்கள்","நாற்பது"),
(269,"person","Governor-General who established Sanskrit college at Benares","Cornwallis","வாரணாசியில் சமஸ்கிருதக் கல்லூரி நிறுவியவர்","காரன்வாலிஸ்"),
(269,"date","Year Sanskrit college at Benares was established","1791","வாரணாசி சமஸ்கிருதக் கல்லூரி நிறுவப்பட்ட ஆண்டு","1791"),
(269,"act","Charter renewal that forced Company toward regular education policy","Charter Act of 1813","கம்பெனியை ஒழுங்கான கல்விக் கொள்கைக்கு தள்ளிய பட்டயப் புதுப்பிப்பு","1813 பட்டயச் சட்டம்"),
(269,"policy","Educational institutions encouraged by Hastings through missionaries","Vernacular schools","ஹேஸ்டிங்ஸ் மறைப்பணியாளர்கள் மூலம் ஊக்குவித்த கல்வி நிலையங்கள்","தாய்மொழிப் பள்ளிகள்"),
(269,"college","College at Calcutta patronised by Hastings for English and Western science","Hindu College","ஆங்கிலம் மற்றும் மேலை அறிவியலுக்காக ஹேஸ்டிங்ஸ் ஆதரித்த கல்கத்தா கல்லூரி","இந்து கல்லூரி"),
(269,"date","Year Hindu College was established","1817","இந்து கல்லூரி நிறுவப்பட்ட ஆண்டு","1817"),
(269,"support","Who financially supported Hindu College in Calcutta","Indian public","கல்கத்தா இந்து கல்லூரியை ஆதரித்தோர்","இந்தியப் பொதுமக்கள்"),
(269,"person","Missionary who further promoted education","Alexander Duff","கல்வி வளர்ச்சியை மேலும் ஊக்குவித்த மறைப்பணியாளர்","அலெக்சாண்டர் டஃப்"),
(269,"date","Year press censorship had been instituted before Hastings abolished it","1799","ஹேஸ்டிங்ஸ் நீக்கிய பத்திரிகைத் தணிக்கை முதலில் விதிக்கப்பட்ட ஆண்டு","1799"),
(269,"newspaper","Bengali weekly started in liberal atmosphere after censorship relaxation","Samachar Darpan","பத்திரிகைத் தணிக்கை தளர்ந்த சூழலில் தொடங்கிய வங்காள வார இதழ்","சமாச்சார் தர்பன்"),
(269,"date","Year Samachar Darpan was started","1818","சமாச்சார் தர்பன் தொடங்கிய ஆண்டு","1818"),
(270,"act","Charter emphasizing development of country primarily for inhabitants","Charter Act of 1833","நாட்டின் மக்களின் வளர்ச்சியை வலியுறுத்திய பட்டயச் சட்டம்","1833 பட்டயச் சட்டம்"),
(270,"person","Governor-General associated with suppressing Thuggee and abolishing Sati","William Bentinck","தக்கர் ஒழிப்பு மற்றும் சதி ஒழிப்புடன் தொடர்புடைய கவர்னர் ஜெனரல்","வில்லியம் பெண்டிங்"),
(270,"policy","Language policy introduced under Bentinck","English as medium of instruction in schools and colleges","பெண்டிங் கால மொழிக் கொள்கை","பள்ளி கல்லூரிகளில் ஆங்கிலத்தை பயிற்றுமொழியாக அறிமுகப்படுத்தல்"),
(270,"goal","Service objective Bentinck associated with English education","Indianization of services","ஆங்கிலக் கல்வியுடன் பெண்டிங் இணைத்த நிர்வாக நோக்கம்","பணிகளின் இந்தியமயமாக்கல்"),
(270,"college","Medical college founded by Bentinck in March 1835","Calcutta Medical College","மார்ச் 1835இல் பெண்டிங் நிறுவிய மருத்துவக் கல்லூரி","கல்கத்தா மருத்துவக் கல்லூரி"),
(270,"date","Month and year Calcutta Medical College was founded","March 1835","கல்கத்தா மருத்துவக் கல்லூரி தொடங்கிய மாதம் மற்றும் ஆண்டு","மார்ச் 1835"),
(270,"date","Year Calcutta Medical College students were sent to London","1844","கல்கத்தா மருத்துவக் கல்லூரி மாணவர்கள் லண்டன் அனுப்பப்பட்ட ஆண்டு","1844"),
(270,"college","Medical college founded in Bombay in 1845","Grant Medical College","1845இல் பம்பாயில் நிறுவப்பட்ட மருத்துவக் கல்லூரி","கிராண்ட் மருத்துவக் கல்லூரி"),
(270,"date","Year Grant Medical College was founded","1845","கிராண்ட் மருத்துவக் கல்லூரி நிறுவப்பட்ட ஆண்டு","1845"),
(270,"college","Engineering college founded at Roorkee in 1847","Thomason Engineering College","1847இல் ரூர்க்கியில் நிறுவப்பட்ட பொறியியல் கல்லூரி","தாம்சன் பொறியியல் கல்லூரி"),
(270,"modern_name","Present institution identified with Thomason Engineering College","IIT Roorkee","தாம்சன் பொறியியல் கல்லூரியின் இன்றைய நிறுவனம்","ஐஐடி ரூர்க்கி"),
(270,"date","Year a school for girls was founded in Calcutta","1849","கல்கத்தாவில் பெண்களுக்கான பள்ளி தொடங்கிய ஆண்டு","1849"),
(270,"person","Law member who came to India in 1835 and headed Board of Education","Macaulay","1835இல் இந்தியா வந்து கல்விக்குழுத் தலைவரான சட்ட உறுப்பினர்","மெக்காலே"),
(270,"date","Year Macaulay came to India as law member","1835","மெக்காலே சட்ட உறுப்பினராக இந்தியா வந்த ஆண்டு","1835"),
(270,"office","Position held by Macaulay in education","President of the Board of Education","கல்வித்துறையில் மெக்காலேயின் பதவி","கல்விக்குழுமத் தலைவர்"),
(270,"policy","Language recommended by Macaulay as literary and official language","English","இலக்கிய மற்றும் அலுவல் மொழியாக மெக்காலே பரிந்துரைத்த மொழி","ஆங்கிலம்"),
(270,"person","Governor-General keenly interested in education after Macaulay","Dalhousie","மெக்காலேக்குப் பின் கல்வியில் ஆழ்ந்த ஆர்வம் காட்டிய கவர்னர் ஜெனரல்","டல்ஹௌசி"),
(270,"person","Lieutenant-Governor who designed vernacular education system approved by Dalhousie","James Thomason","டல்ஹௌசி ஆதரித்த தாய்மொழிக் கல்வி முறையை வடிவமைத்த துணை ஆளுநர்","ஜேம்ஸ் தாம்சன்"),
(270,"period","James Thomason's Lieutenant-Governorship of North-Western Provinces","1843–1853","ஜேம்ஸ் தாம்சனின் வடமேற்கு மாகாண துணை ஆளுநர் காலம்","1843–1853"),
(270,"document","Educational Dispatch outlining comprehensive scheme in 1854","Charles Wood's Educational Dispatch","1854இல் விரிவான கல்வித் திட்டத்தை வகுத்த ஆவணம்","சார்லஸ் உட் கல்வி அறிக்கை"),
(270,"date","Year of Charles Wood's Educational Dispatch","1854","சார்லஸ் உட் கல்வி அறிக்கை வெளியான ஆண்டு","1854"),
(270,"levels","Levels covered by Wood's educational scheme","Primary, secondary and collegiate","உட் கல்வித் திட்டம் உள்ளடக்கிய நிலைகள்","ஆரம்ப, இடைநிலை மற்றும் கல்லூரி"),
(270,"department","Administrative body organised under Wood's scheme","Departments of Public Instruction","உட் திட்டத்தில் அமைக்கப்பட்ட நிர்வாகத் துறை","பொதுக் கல்வித்துறை"),
(270,"university","University established under Wood's plan in Madras","University of Madras","உட் திட்டத்தின் கீழ் மதராசில் நிறுவப்பட்ட பல்கலைக்கழகம்","சென்னைப் பல்கலைக்கழகம்"),
(270,"date","Year University of Madras was established","1857","சென்னைப் பல்கலைக்கழகம் நிறுவப்பட்ட ஆண்டு","1857"),
(270,"university","Another university established in 1857 under the plan","University of Bombay","1857இல் நிறுவப்பட்ட மற்றொரு பல்கலைக்கழகம்","பம்பாய் பல்கலைக்கழகம்"),
(270,"university","Another university established in 1857 under the plan","University of Calcutta","1857இல் நிறுவப்பட்ட மற்றொரு பல்கலைக்கழகம்","கல்கத்தா பல்கலைக்கழகம்"),
(270,"policy","Dalhousie's modification of Macaulay policy","Encouraged vernacular educational institutions","மெக்காலே கொள்கையில் டல்ஹௌசி செய்த மாற்றம்","தாய்மொழிக் கல்வி நிலையங்களை ஊக்குவித்தல்"),
(270,"policy","Financial principle Dalhousie accepted for private education","Grants-in-aid irrespective of caste or creed","தனியார் கல்விக்கு டல்ஹௌசி ஏற்ற நிதிக் கொள்கை","சாதி மத வேறுபாடின்றி மானிய உதவி"),
(270,"meaning","Meaning of a charter in the chapter","Sovereign grant creating institution with stated rights and privileges","பாடநூலில் பட்டயம் என்பதன் பொருள்","உரிமைகள் மற்றும் சலுகைகளுடன் நிறுவனம் உருவாக்கும் இறையாண்மை அனுமதி"),
(270,"date","Year Queen Elizabeth's charter created East India Company","1600","எலிசபெத் ராணியின் பட்டயத்தால் கிழக்கிந்தியக் கம்பெனி தொடங்கிய ஆண்டு","1600"),
(270,"cycle","Renewal interval of Company charter after 1773","Every twenty years","1773க்கு பின் கம்பெனி பட்டயம் புதுப்பிக்கப்பட்ட இடைவெளி","ஒவ்வொரு இருபது ஆண்டுகளும்"),
(270,"act","Last Charter Act before Crown rule","Charter Act of 1853","கிரௌன் ஆட்சிக்கு முன் கடைசி பட்டயச் சட்டம்","1853 பட்டயச் சட்டம்"),

# Pindari, Thuggee, Sati
(270,"group","Freebooter bands composed of both Muslim and Hindu members","Pindaris","இந்தும் முஸ்லிமும் சேர்ந்த கொள்ளைக் குழுக்கள்","பிண்டாரிகள்"),
(270,"cause","Policy that helped swell Pindari numbers","Subsidiary Alliance and disbandment of soldiers","பிண்டாரிகள் அதிகரிக்க உதவிய கொள்கை","துணைப்படைத் திட்டமும் படை கலைப்பும்"),
(271,"war","War proclaimed by British against Pindaris that became war against Marathas","Pindari War","பிண்டாரிகளுக்கு எதிராக அறிவிக்கப்பட்டு மராத்தியப் போராக மாறிய போர்","பிண்டாரிப் போர்"),
(271,"period","Period of prolonged Pindari/Maratha conflict given in chapter","1811–1818","பிண்டாரி/மராத்திய நீண்டகாலப் போர் காலம்","1811–1818"),
(271,"result","Territorial result of Pindari War","Whole of Central India came under British rule","பிண்டாரிப் போரின் நிலப்பரப்பு விளைவு","மத்திய இந்தியா முழுவதும் பிரிட்டிஷ் ஆட்சிக்குள் வந்தது"),
(271,"group","Robbers operating between Delhi and Agra from fourteenth century","Thugs","14ஆம் நூற்றாண்டிலிருந்து டெல்லி-ஆக்ரா இடையில் செயல்பட்ட கொள்ளைக் குழு","தக்கர்கள்"),
(271,"religious","Deity in whose name Thugs murdered travellers","Goddess Kali","தக்கர்கள் வழிப்போக்கர்களைக் கொன்றதாகக் கூறப்பட்ட தெய்வத்தின் பெயர்","காளி"),
(271,"person","Officer placed by Bentinck in charge of suppressing Thuggee","William Sleeman","தக்கர் அச்சுறுத்தலை ஒடுக்க பெண்டிங் நியமித்த அதிகாரி","வில்லியம் ஸ்லீமன்"),
(271,"period","Years during which more than 3000 Thugs were convicted","1831–1837","3000க்கும் மேற்பட்ட தக்கர்கள் தண்டிக்கப்பட்ட காலம்","1831–1837"),
(271,"number","Number of Thugs who became approvers","500","அரசு சாட்சிகளான தக்கர்கள் எண்ணிக்கை","500"),
(271,"date","Approximate year by which Thuggee problem ceased","1860","தக்கர் பிரச்சினை முடிவுற்ற சுமார் ஆண்டு","1860"),
(271,"practice","Practice abolished by Bentinck's 1829 law","Sati","1829 பெண்டிங் சட்டத்தால் ஒழிக்கப்பட்ட நடைமுறை","சதி"),
(271,"act","Law enacted by Bentinck to end Sati","Sati Abolition Act, 1829","சதியை முடிவுக்கு கொண்டு வந்த பெண்டிங் சட்டம்","சதி ஒழிப்புச் சட்டம், 1829"),
(271,"person","Indian reformer whose campaigns were decisive in abolition of Sati","Raja Rammohan Roy","சதி ஒழிப்பில் தீர்மான பங்கு வகித்த இந்திய சீர்திருத்தவாதி","ராஜா ராம்மோகன் ராய்"),

# Railways and telegraph
(271,"group","Community making first serious proposal for railways","European business community","இருப்புப்பாதைக்கான முதல் தீவிர முன்மொழிவை வைத்த குழு","ஐரோப்பிய வணிகச் சமூகம்"),
(271,"person","Governor-General who persuaded Directors of railway advantages","Dalhousie","இருப்புப்பாதையின் நன்மைகளை இயக்குநர்களிடம் வலியுறுத்திய கவர்னர் ஜெனரல்","டல்ஹௌசி"),
(271,"distance","Railway track laid before Great Rebellion","Less than 300 miles","1857 பெருங்கிளர்ச்சிக்கு முன் அமைக்கப்பட்ட இருப்புப்பாதை தூரம்","300 மைலுக்கு குறைவு"),
(271,"date","Year telegraph service was inaugurated in India","1854","இந்தியாவில் தந்திச் சேவை தொடங்கிய ஆண்டு","1854"),
(271,"event","Event demonstrating importance of telegraph","Great Rebellion of 1857","தந்தியின் முக்கியத்துவத்தை உணர்த்திய நிகழ்வு","1857 பெருங்கிளர்ச்சி"),
(271,"speed","Communication time from London to Calcutta after telegraph","Twenty-eight minutes","தந்தியால் லண்டன்-கல்கத்தா தொடர்பு எடுத்த நேரம்","28 நிமிடங்கள்"),
(271,"canal","Canal whose opening shortened Europe-India journey","Suez Canal","ஐரோப்பா-இந்தியா பயணத்தை குறைத்த கால்வாய்","சூயஸ் கால்வாய்"),
(271,"date","Year Suez Canal opened","1869","சூயஸ் கால்வாய் திறந்த ஆண்டு","1869"),
(271,"distance","Approximate reduction in Europe-India journey due to Suez Canal","4000 miles","சூயஸ் கால்வாயால் ஐரோப்பா-இந்தியா பயணத் தூரம் குறைந்த அளவு","சுமார் 4000 மைல்கள்"),
(271,"date","Year British India had effective contact with Secretary of State in London","1870","லண்டன் இந்திய அலுவலக அரசுச் செயலருடன் பிரிட்டிஷ் இந்தியா திறம்பட தொடர்பு கொண்ட ஆண்டு","1870"),
(271,"place","Headquarters in London referred to as Whitehall","India Office/imperial headquarters","Whitehall எனப் பாடநூலில் குறிப்பிடப்பட்ட லண்டன் தலைமையகம்","இந்தியா அலுவலகம்/பேரரசு தலைமையகம்"),
(271,"person","Governor-General identified as exception to reluctance to act without Whitehall","Curzon","Whitehall அனுமதியின்றி செயல்பட தயங்கியவர்களில் விதிவிலக்காகக் குறிப்பிடப்பட்ட கவர்னர் ஜெனரல்","கர்சன்"),
(271,"route","First Indian railway line opened in 1853","Bombay to Thane","1853இல் திறக்கப்பட்ட முதல் இந்திய இருப்புப்பாதை","பம்பாய் முதல் தானே"),
(271,"date","Year Bombay-Thane railway opened","1853","பம்பாய்-தானே இருப்புப்பாதை திறந்த ஆண்டு","1853"),
(271,"route","Railway opened in 1854–55","Howrah to Raniganj","1854–55இல் திறக்கப்பட்ட இருப்புப்பாதை","ஹௌரா முதல் ராணிகஞ்ச்"),
(271,"route","First railway line in South India","Royapuram to Arcot (Wallajah Road)","தென்னிந்தியாவின் முதல் இருப்புப்பாதை","ராயபுரம் முதல் ஆர்க்காடு (வாலாஜா ரோடு)"),
(271,"date","Year first South Indian railway line opened","1856","தென்னிந்தியாவின் முதல் இருப்புப்பாதை திறந்த ஆண்டு","1856"),
(271,"station","Station inaugurated in 1856 on first South Indian railway","Royapuram","1856 தென்னிந்திய முதல் இருப்புப்பாதையில் திறக்கப்பட்ட நிலையம்","ராயபுரம்"),

# Irrigation
(272,"policy","British approach to irrigation described in chapter","Neglect","பாசன வசதிக்கு பிரிட்டிஷ் அணுகுமுறை","புறக்கணிப்பு"),
(272,"person","Engineer whose personal enthusiasm led to irrigation works in Madras","Arthur Cotton","சென்னை மாகாணத்தில் தனிப்பட்ட ஆர்வத்தால் பாசனப் பணிகளை மேற்கொண்ட பொறியாளர்","ஆர்தர் காட்டன்"),
(272,"river","River across which Cotton built a dam in 1836","Kollidam (Coleroon)","1836இல் ஆர்தர் காட்டன் அணை கட்டிய ஆறு","கொள்ளிடம்"),
(272,"date","Year Cotton built dam across Kollidam","1836","கொள்ளிடத்தில் அணை கட்டப்பட்ட ஆண்டு","1836"),
(272,"river","River across which dam work began in 1853","Krishna","1853இல் அணை கட்டும் பணி தொடங்கிய ஆறு","கிருஷ்ணா"),
(272,"date","Year Krishna dam work began","1853","கிருஷ்ணா அணை பணி தொடங்கிய ஆண்டு","1853"),
(272,"canal","North Indian canal completed in 1830","Jumna canal","1830இல் முடிக்கப்பட்ட வடஇந்திய கால்வாய்","யமுனா கால்வாய்"),
(272,"date","Year Jumna canal was completed","1830","யமுனா கால்வாய் முடிக்கப்பட்ட ஆண்டு","1830"),
(272,"canal","Canal extended to nearly 450 miles by 1857","Ganges canal","1857க்குள் சுமார் 450 மைல் நீட்டிக்கப்பட்ட கால்வாய்","கங்கை கால்வாய்"),
(272,"distance","Length reached by Ganges canal by 1857","Nearly 450 miles","1857க்குள் கங்கை கால்வாயின் நீளம்","சுமார் 450 மைல்கள்"),
(272,"canal","Punjab canal excavated by 1856","Bari Doab canal","1856க்குள் பஞ்சாபில் தோண்டப்பட்ட கால்வாய்","பாரி தோஆப் கால்வாய்"),
(272,"effect","Ecological effect of canal irrigation noted","Soil salinity and water logging","கால்வாய் பாசனத்தின் சுற்றுச்சூழல் விளைவு","மண் உப்புத்தன்மையும் நீர்தேக்கமும்"),

# Forests
(272,"revenue","Mainstay of British Indian fiscal system","Land revenue","பிரிட்டிஷ் இந்திய வருவாய் அமைப்பின் முதுகெலும்பு","நிலவரி"),
(272,"policy","Reason forests were destroyed under colonial state","Expansion of cultivable land","காலனி ஆட்சியில் காடுகள் அழிக்கப்பட்ட முக்கிய காரணம்","பயிரிடத்தக்க நிலத்தை விரிவுபடுத்துதல்"),
(272,"region","Forest region converted into zamins and auctioned","Jungle Mahals","ஜமீன்களாக மாற்றப்பட்டு ஏலமிடப்பட்ட காட்டு பகுதி","ஜங்கிள் மஹால்கள்"),
(272,"tribe","Original inhabitants evicted from Jungle Mahals","Santhals","ஜங்கிள் மஹால்களில் இருந்து வெளியேற்றப்பட்ட பூர்வீக மக்கள்","சந்தால்கள்"),
(272,"claim","Tribal group identified as first to resist British rule","Santhals","பிரிட்டிஷ் ஆட்சியை முதலில் எதிர்த்த பழங்குடி எனக் குறிப்பிடப்பட்டோர்","சந்தால்கள்"),
(272,"cultivation","Cultivation encouraged in hilly and mountainous tracts","Slope cultivation","மலைப்பகுதிகளில் ஊக்குவிக்கப்பட்ட சாகுபடி முறை","மலைச்சரிவு சாகுபடி"),
(272,"beneficiary","Group receiving hill land cheaply for plantation crops","European enterprises","தோட்டப் பயிர்களுக்கு மலை நிலம் குறைந்த விலையில் பெற்றவர்கள்","ஐரோப்பிய நிறுவனங்கள்"),
(272,"crop","Plantation crop whose failed experiments destroyed virgin forests","Coffee","பயிரிடும் முயற்சியால் பல கன்னிக் காடுகள் அழிந்த தோட்டப் பயிர்","காப்பி"),
(272,"cause","Infrastructure causing massive timber exploitation","Railway construction","மர வளத்தின் பெரும் சுரண்டலுக்குக் காரணமான கட்டமைப்பு","இருப்புப்பாதை கட்டுமானம்"),
(272,"period","Decade when one million sleepers annually were estimated needed","1870s","ஆண்டுக்கு பத்து லட்சம் தண்டவாளக் குறுக்குக் கட்டைகள் தேவை என கணிக்கப்பட்ட காலம்","1870கள்"),
(272,"number","Annual railway sleepers estimated needed in 1870s","One million","1870களில் ஆண்டுதோறும் தேவைப்பட்ட இருப்புப்பாதை குறுக்குக் கட்டைகள்","பத்து லட்சம்"),
(272,"tree","One Indian tree preferred for railway sleepers","Sal","இருப்புப்பாதை குறுக்குக் கட்டைகளுக்கு விரும்பப்பட்ட மரம்","சால்"),
(272,"tree","One Indian tree preferred for railway sleepers","Deodar","இருப்புப்பாதை குறுக்குக் கட்டைகளுக்கு விரும்பப்பட்ட மரம்","தேவதாரு"),
(272,"tree","One Indian tree preferred for railway sleepers","Teak","இருப்புப்பாதை குறுக்குக் கட்டைகளுக்கு விரும்பப்பட்ட மரம்","தேக்கு"),
(272,"region","Region where much sal timber was extracted","Jungle Mahals of West Bengal and Bihar","சால் மரம் பெருமளவில் வெட்டப்பட்ட பகுதி","மேற்கு வங்காளம் மற்றும் பீகாரின் ஜங்கிள் மஹால்கள்"),
(272,"department","Department created to manage and control forest resources","Forest Department","காட்டு வளங்களை நிர்வகிக்க உருவாக்கப்பட்ட துறை","வனத்துறை"),
(272,"act","Act passed to control forest resources","Indian Forest Act, 1865","காட்டு வளங்களை கட்டுப்படுத்த இயற்றப்பட்ட சட்டம்","இந்திய வனச் சட்டம், 1865"),
(272,"date","Year Indian Forest Act was passed","1865","இந்திய வனச் சட்டம் இயற்றப்பட்ட ஆண்டு","1865"),
(272,"effect","Whose forest use was restricted by Indian Forest Act","Indigenous groups","இந்திய வனச் சட்டத்தால் காட்டு வளப் பயன்பாடு கட்டுப்படுத்தப்பட்டோர்","பூர்வீகக் குழுக்கள்"),
(272,"act","Act enacted in 1871 to contain protest and resistance","Criminal Tribes Act","எதிர்ப்பு மற்றும் மறுப்பை கட்டுப்படுத்த 1871இல் இயற்றப்பட்ட சட்டம்","குற்றப் பழங்குடியினர் சட்டம்"),
(272,"date","Year Criminal Tribes Act was enacted","1871","குற்றப் பழங்குடியினர் சட்டம் இயற்றப்பட்ட ஆண்டு","1871"),

# Deindustrialization
(272,"trade","Earlier trade imbalance between Europe and East","Europe imported more from East than it exported","ஐரோப்பா-கிழக்கு நாடுகளின் ஆரம்ப வாணிப சமநிலையின்மை","ஐரோப்பா கிழக்கிலிருந்து அதிகம் இறக்குமதி செய்தது"),
(272,"commodity","One major eastern export to Europe","Spices","ஐரோப்பாவுக்கு கிழக்கிலிருந்து சென்ற முக்கிய பொருள்","நறுமணப் பொருட்கள்"),
(272,"commodity","One major eastern export to Europe","Silks","ஐரோப்பாவுக்கு கிழக்கிலிருந்து சென்ற முக்கிய பொருள்","பட்டு"),
(272,"commodity","One major eastern export to Europe","Calicos","ஐரோப்பாவுக்கு கிழக்கிலிருந்து சென்ற முக்கிய பொருள்","காலிகோ துணிகள்"),
(272,"change","Development that reversed old Europe-East trade relationship","Industrial Revolution in English textile production","ஐரோப்பா-கிழக்கு பழைய வாணிப உறவை மாற்றிய வளர்ச்சி","இங்கிலாந்து ஜவுளித் தொழிற்புரட்சி"),
(272,"process","Colonial economic process imposed on India","Deindustrialization","இந்தியாவில் காலனி ஆட்சி ஏற்படுத்திய பொருளாதார செயல்முறை","தொழில் முடக்கம்"),
(272,"shift","India's textile-market transformation","From leading cloth exporter to market for Lancashire cottons","இந்திய ஜவுளி சந்தையின் மாற்றம்","உலகத் துணி ஏற்றுமதி முன்னணியிலிருந்து லங்காஷயர் துணி சந்தையாக மாறியது"),
(272,"cause","Reason machine-made British goods displaced Indian goods","Cheaper and more durable","பிரிட்டிஷ் இயந்திரப் பொருட்கள் இந்தியப் பொருட்களை மாற்றிய காரணம்","குறைந்த விலையும் அதிக நீடித்த தன்மையும்"),
(272,"policy","Import policy followed by Company in first three decades","Unrestricted flow of British imports","கம்பெனி ஆரம்ப மூன்று தசாப்தங்களில் பின்பற்றிய இறக்குமதி கொள்கை","பிரிட்டிஷ் பொருட்களுக்கு தடையற்ற இறக்குமதி"),
(272,"duty","Import-duty treatment of English goods","No import duty","ஆங்கிலப் பொருட்களின் இறக்குமதி வரி நிலை","இறக்குமதி வரி இல்லை"),
(272,"barrier","Policy restricting Indian manufactures in British market","High protective duties","பிரிட்டிஷ் சந்தையில் இந்திய உற்பத்திகளைத் தடுத்த கொள்கை","உயர் பாதுகாப்பு வரிகள்"),
(273,"effect","Group ruined by unequal tariff policy","Indian weavers and traders","சமமற்ற வரிக் கொள்கையால் பாதிக்கப்பட்டோர்","இந்திய நெசவாளர்களும் வணிகர்களும்"),
(273,"effect","Occupation to which displaced weavers shifted","Agriculture","வேலை இழந்த நெசவாளர்கள் மாறிய வாழ்வாதாரம்","வேளாண்மை"),
(273,"effect","Result of displaced weavers entering agriculture","Increased pressure on overcrowded land","நெசவாளர்கள் வேளாண்மைக்கு வந்ததால் ஏற்பட்ட விளைவு","ஏற்கனவே நெருக்கடியான நிலத்தின் மீது அழுத்தம் அதிகரித்தது"),
(273,"person","British official who testified on decline of Dacca in 1840","Charles Trevelyan","1840இல் டாக்கா வீழ்ச்சி குறித்து சாட்சி அளித்த பிரிட்டிஷ் அதிகாரி","சார்ல்ஸ் ட்ரெவெல்யன்"),
(273,"body","Body before which Trevelyan made his 1840 observation","Select Committee of the House of Commons","1840இல் ட்ரெவெல்யன் கருத்து தெரிவித்த அமைப்பு","பிரிட்டிஷ் பொதுமன்ற தேர்வுக்குழு"),
(273,"date","Year Trevelyan made observation on Dacca","1840","டாக்கா குறித்து ட்ரெவெல்யன் கருத்து தெரிவித்த ஆண்டு","1840"),
(273,"city","City once described as Manchester of India","Dacca","இந்தியாவின் மான்செஸ்டர் என அழைக்கப்பட்ட நகரம்","டாக்கா"),
(273,"population","Earlier population figure cited for Dacca","150,000","டாக்காவின் முன்பைய மக்கள்தொகை என கூறப்பட்ட எண்","150,000"),
(273,"population","Later population range cited for Dacca","30,000–40,000","டாக்காவின் பிற்கால மக்கள்தொகை என கூறப்பட்ட வரம்பு","30,000–40,000"),
(273,"person","French Catholic missionary who wrote of weaver misery before returning in 1823","Abbe Dubois","1823க்கு முன் நெசவாளர் துயரை எழுதிய பிரெஞ்சு கத்தோலிக்க மறைப்பணியாளர்","அபே டுபாய்ஸ்"),
(273,"person","Governor-General quoted on bones of cotton weavers bleaching Gangetic plains","William Bentinck","கங்கை சமவெளியில் பருத்தி நெசவாளர்களின் எலும்புகள் கிடப்பதாக கூறிய கவர்னர் ஜெனரல்","வில்லியம் பெண்டிங்"),
(273,"budget","Average share of British Indian budget consumed by military and civil administration","80 percent","பிரிட்டிஷ் இந்திய பட்ஜெட்டில் இராணுவ மற்றும் குடிமை நிர்வாகச் செலவுகள் எடுத்த சராசரி பங்கு","80 சதவீதம்"),
(273,"budget","Budget share left for all other departments","20 percent","மற்ற துறைகளுக்கு மீதமிருந்த பட்ஜெட் பங்கு","20 சதவீதம்"),
(273,"person","Engineer who urged priority for irrigation over railways","Arthur Cotton","இருப்புப்பாதையை விட பாசனத்திற்கு முன்னுரிமை கோரிய பொறியாளர்","ஆர்தர் காட்டன்"),
(273,"policy","Actual effect of Ryotwari according to chapter","Strengthened big landlords rather than independent peasants","பாடநூலின்படி இரயத்துவாரியின் உண்மையான விளைவு","சுயாதீன விவசாயிகளை விட பெரிய நில உரிமையாளர்களை வலுப்படுத்தியது"),
(273,"commission","Commission exposing revenue and police atrocities in Madras","Torture Commission","சென்னையில் வருவாய் மற்றும் காவல் அதிகாரிகளின் கொடுமைகளை வெளிப்படுத்திய ஆணையம்","சித்திரவதை ஆணையம்"),
(273,"date","Year Torture Commission report was presented","1855","சித்திரவதை ஆணைய அறிக்கை சமர்ப்பிக்கப்பட்ட ஆண்டு","1855"),
(273,"act","Law justifying forcible land-revenue collection","Torture Act","வலுக்கட்டாய நிலவரி வசூலை நியாயப்படுத்திய சட்டம்","சித்திரவதைச் சட்டம்"),
(273,"date","Time after which Torture Act was abolished","After 1858","சித்திரவதைச் சட்டம் ஒழிக்கப்பட்ட காலம்","1858க்குப் பின்"),

# Famines
(273,"trend","Effect of British colonial rule on famine","Increased frequency and deadliness","பிரிட்டிஷ் காலனி ஆட்சியில் பஞ்சத்தின் போக்கு","அடிக்கடி தோன்றி கொடியதாய் மாறியது"),
(273,"period","Period with only four famines","1800–1825","நான்கு பஞ்சங்கள் மட்டுமே இருந்த காலம்","1800–1825"),
(273,"number","Number of famines between 1800 and 1825","Four","1800–1825 இடையிலான பஞ்சங்கள் எண்ணிக்கை","நான்கு"),
(273,"number","Number of famines in last quarter of nineteenth century","Twenty-two","19ஆம் நூற்றாண்டின் கடைசி காலாண்டில் ஏற்பட்ட பஞ்சங்கள்","22"),
(273,"deaths","Estimated deaths from famines in last quarter of nineteenth century","Over five million","19ஆம் நூற்றாண்டின் கடைசி காலாண்டுப் பஞ்சங்களில் இறந்தோர் மதிப்பீடு","ஐந்து மில்லியனுக்கும் மேல்"),
(273,"person","Former ICS officer and nationalist who enumerated ten mass famines","Romesh Chunder Dutt","பத்து பெரும் பஞ்சங்களை கணக்கிட்ட முன்னாள் ICS அதிகாரியும் தேசியவாதியும்","ரோமேஷ் சந்திர தத்"),
(273,"date","Year R.C. Dutt made famine enumeration","1901","ஆர்.சி. தத் பஞ்சங்களை கணக்கிட்ட ஆண்டு","1901"),
(273,"number","Mass famines since 1860s enumerated by R.C. Dutt","Ten","1860களுக்குப் பின் ஆர்.சி. தத் பட்டியலிட்ட பெரும் பஞ்சங்கள்","பத்து"),
(273,"deaths","Total death toll estimated by R.C. Dutt","15 million","ஆர்.சி. தத் மதிப்பிட்ட மொத்த பஞ்ச மரணங்கள்","15 மில்லியன்"),
(274,"policy","Economic principle colonial state applied to famines from 1833","Laissez faire","1833 முதல் பஞ்சங்களுக்கும் பயன்படுத்தப்பட்ட காலனி பொருளாதாரக் கொள்கை","தலையிடாமைக் கொள்கை"),
(274,"meaning","Meaning of laissez faire in the chapter","Non-intervention of government in trade","பாடநூலில் laissez faire என்பதன் பொருள்","வாணிபத்தில் அரசு தலையிடாமை"),
(274,"famine","Famine cited as proof of nationalist argument on impoverishment","Orissa famine","பிரிட்டிஷ் ஆட்சி வறுமையை உண்டாக்கியது என்ற தேசியவாத வாதத்திற்கு சான்றாகக் கூறப்பட்ட பஞ்சம்","ஒரிசா பஞ்சம்"),
(274,"fraction","Population share said to have died in Orissa famine","One third","ஒரிசா பஞ்சத்தில் இறந்ததாகக் கூறப்பட்ட மக்கள்தொகை பங்கு","மூன்றில் ஒன்று"),
(274,"person","Nationalist prompted by Orissa famine to investigate Indian poverty","Dadabhai Naoroji","ஒரிசா பஞ்சத்தால் இந்திய வறுமையை ஆய்வு செய்யத் தூண்டப்பட்ட தேசியவாதி","தாதாபாய் நௌரோஜி"),
(274,"famine","Severe Madras Presidency famine caused by two failed monsoons","Madras Famine of 1876–78","இரண்டு பருவமழைத் தோல்வியால் ஏற்பட்ட சென்னை மாகாணப் பெரும் பஞ்சம்","1876–78 சென்னைப் பஞ்சம்"),
(274,"cause","Immediate climatic cause of Madras Famine 1876–78","Failure of two successive monsoons","1876–78 சென்னைப் பஞ்சத்தின் காலநிலை காரணம்","தொடர்ச்சியான இரண்டு பருவமழைகளின் தோல்வி"),
(274,"person","Viceroy who adopted hands-off approach during Madras famine","Lytton","சென்னைப் பஞ்சத்தில் தலையிடாமைக் கொள்கை பின்பற்றிய வைஸ்ராய்","லிட்டன்"),
(274,"deaths","Deaths in Madras Presidency famine according to chapter","3.5 million","பாடநூலின்படி சென்னை மாகாணப் பஞ்சத்தில் இறந்தோர்","3.5 மில்லியன்"),
(274,"district","Madras Presidency district whose 1833 famine eyewitness account is quoted","Guntur","1833 பஞ்சம் குறித்து நேரடி சாட்சி மேற்கோள் கொள்ளப்பட்ட சென்னை மாகாண மாவட்டம்","குண்டூர்"),

# Indentured labour
(274,"region","One colony requiring large plantation labour under slope cultivation","Ceylon","தோட்டப் பயிரிடுதலுக்கு பெரும் தொழிலாளர் தேவைப்பட்ட காலனி","இலங்கை"),
(274,"region","One colony requiring large plantation labour","Mauritius","தோட்டப் பயிரிடுதலுக்கு பெரும் தொழிலாளர் தேவைப்பட்ட காலனி","மொரீஷியஸ்"),
(274,"region","One colony requiring large plantation labour","Fiji","தோட்டப் பயிரிடுதலுக்கு பெரும் தொழிலாளர் தேவைப்பட்ட காலனி","பிஜி"),
(274,"region","One colony requiring large plantation labour","Malaya","தோட்டப் பயிரிடுதலுக்கு பெரும் தொழிலாளர் தேவைப்பட்ட காலனி","மலேயா"),
(274,"region","One colony requiring large plantation labour","Caribbean islands","தோட்டப் பயிரிடுதலுக்கு பெரும் தொழிலாளர் தேவைப்பட்ட காலனி","கரீபியன் தீவுகள்"),
(274,"region","One colony requiring large plantation labour","Natal and South Africa","தோட்டப் பயிரிடுதலுக்கு பெரும் தொழிலாளர் தேவைப்பட்ட காலனி","நேட்டால் மற்றும் தென்னாப்பிரிக்கா"),
(274,"labour","Labour system used initially on plantations","Slave labour","தோட்டங்களில் ஆரம்பத்தில் பயன்படுத்தப்பட்ட தொழிலாளர் முறை","அடிமை உழைப்பு"),
(274,"date","Year Company government abolished slavery in India","1843","கம்பெனி அரசு இந்தியாவில் அடிமை முறையை ஒழித்த ஆண்டு","1843"),
(274,"system","Labour system used after abolition of slavery","Indentured labour system","அடிமை ஒழிப்புக்குப் பின் பயன்படுத்தப்பட்ட தொழிலாளர் முறை","ஒப்பந்தக் கூலி முறை"),
(274,"duration","Contract period under indentured labour","Five years","ஒப்பந்தக் கூலி முறையின் ஒப்பந்த காலம்","ஐந்து ஆண்டுகள்"),
(274,"benefit","Return provision promised at end of indenture","Passage paid to homeland","ஒப்பந்த முடிவில் வாக்குறுதியான திரும்பிச் செல்லும் வசதி","தாய்நாட்டிற்கான பயணச் செலவு"),
(274,"agents","Agents used to recruit or kidnap landless labourers","Kanganis","நிலமற்ற தொழிலாளர்களை ஏமாற்றி அல்லது கடத்தி சேர்த்த முகவர்கள்","கங்காணிகள்"),
(274,"number","First group of indentured labourers sent from Thanjavur to Ceylon coffee plantations","150","தஞ்சாவூரிலிருந்து இலங்கை காப்பித் தோட்டங்களுக்கு முதலில் அனுப்பப்பட்ட ஒப்பந்தக் கூலிகள்","150"),
(274,"date","Year first 150 indentured labourers were sent from Thanjavur","1828","தஞ்சாவூரிலிருந்து முதல் 150 ஒப்பந்தக் கூலிகள் அனுப்பப்பட்ட ஆண்டு","1828"),
(274,"destination","Destination of first indentured labourers from Thanjavur","British coffee plantations in Ceylon","தஞ்சாவூரின் முதல் ஒப்பந்தக் கூலிகள் அனுப்பப்பட்ட இடம்","இலங்கையின் பிரிட்டிஷ் காப்பித் தோட்டங்கள்"),
(274,"result","Fate of first 150 indentured labourers","All deserted","முதல் 150 ஒப்பந்தக் கூலிகளின் முடிவு","அனைவரும் தப்பிச் சென்றனர்"),
(274,"period","Decade when recruitment was backed by criminal laws against desertion","1830s","தப்பிச் செல்ல தடை விதிக்கும் குற்றச் சட்டங்களுடன் ஆட்சேர்ப்பு நடந்த காலம்","1830கள்"),
(274,"date","Year Governor of Madras received request from Governor of Ceylon for coolies","1815","இலங்கை ஆளுநரிடமிருந்து கூலிகள் கோரி சென்னை ஆளுநர் கடிதம் பெற்ற ஆண்டு","1815"),
(274,"district","Collector consulted by Madras Governor about labour migration","Thanjavur","தொழிலாளர் இடம்பெயர்வு குறித்து சென்னை ஆளுநர் ஆலோசித்த மாவட்டம்","தஞ்சாவூர்"),
(274,"famine","One famine that pushed people from Madras to Ceylon","Famine of 1833","சென்னையிலிருந்து இலங்கைக்கு மக்கள் செல்லத் தூண்டிய பஞ்சம்","1833 பஞ்சம்"),
(274,"famine","Another famine that pushed people from Madras to Ceylon","Famine of 1843","சென்னையிலிருந்து இலங்கைக்கு மக்கள் செல்லத் தூண்டிய மற்றொரு பஞ்சம்","1843 பஞ்சம்"),
(274,"period","Period in which nearly 1.5 million moved from Madras to Ceylon as indentured labour","1843–1868","சென்னையிலிருந்து இலங்கைக்கு சுமார் 15 லட்சம் ஒப்பந்தக் கூலிகள் சென்ற காலம்","1843–1868"),
(274,"number","Exact number cited as indentured migrants from Madras to Ceylon, 1843–1868","1,444,407","1843–1868 சென்னையிலிருந்து இலங்கை சென்ற ஒப்பந்தக் கூலிகளின் குறிப்பிடப்பட்ட எண்ணிக்கை","14,44,407"),
(275,"character","Nature of indentured labour contract described in chapter","Penal contract system","பாடநூலில் ஒப்பந்தக் கூலி முறையின் தன்மை","தண்டனை சார்ந்த ஒப்பந்த முறை"),
(275,"condition","Working condition of indentured labourers","Jail-like conditions","ஒப்பந்தக் கூலிகளின் பணிச்சூழல்","சிறைச்சாலை போன்ற சூழல்"),
(275,"penalty","One punishment for negligence or refusal to work","Forfeiture of wages or imprisonment","பணியைக் கவனிக்காதது அல்லது மறுத்ததற்கான தண்டனை","கூலி பறிமுதல் அல்லது சிறை"),
(275,"restriction","Association restriction under indentured labour","No unions to demand wage increase or terminate contract","ஒப்பந்தக் கூலி முறையின் சங்கத் தடை","ஊதிய உயர்வு அல்லது ஒப்பந்த முடிவுக்காக சங்கம் அமைக்க முடியாது"),
(275,"song","Bharati song describing plight of women plantation workers","Karumbu thottathile","பெண் தோட்டத் தொழிலாளர்களின் துயரை விளக்கும் பாரதி பாடல்","கரும்புத் தோட்டத்திலே"),

# Drain of Wealth
(274,"person","Nationalist who formulated Drain of Wealth argument in the chapter","Dadabhai Naoroji","செல்வச் சுரண்டல் கோட்பாட்டுடன் தொடர்புடைய தேசியவாதி","தாதாபாய் நௌரோஜி"),
(274,"book","Book in which Naoroji explained British economic drain","Poverty and Un-British Rule in India","ஆங்கிலேய பொருளாதாரச் சுரண்டலை நௌரோஜி விளக்கிய நூல்","Poverty and Un-British Rule in India"),
(275,"term","Naoroji's term for payments remitted to England","Home Charges","இங்கிலாந்திற்கு அனுப்பப்பட்ட செலவுகளுக்கான நௌரோஜியின் சொல்","Home Charges / உள்நாட்டு செலவுக் கட்டணம்"),
(275,"charge","One component of Home Charges","Incentive to Company shareholders","Home Charges இன் ஒரு கூறு","கம்பெனி பங்குதாரர்களுக்கான ஊக்கத் தொகை"),
(275,"charge","One component of Home Charges","Savings and salaries of European officials, traders and planters remitted to England","Home Charges இன் ஒரு கூறு","ஐரோப்பிய அதிகாரிகள், வணிகர்கள், தோட்ட முதலாளிகளின் சேமிப்பு மற்றும் ஊதியம்"),
(275,"charge","One component of Home Charges","Pensions of retired civil and military servants","Home Charges இன் ஒரு கூறு","ஓய்வு பெற்ற குடிமை மற்றும் இராணுவப் பணியாளர்களின் ஓய்வூதியம்"),
(275,"charge","One component of Home Charges","Salaries of India Office staff and Secretary in London","Home Charges இன் ஒரு கூறு","லண்டன் இந்திய அலுவலக ஊழியர் மற்றும் செயலரின் ஊதியம்"),
(275,"charge","One component of Home Charges","War expenses and interest on loans","Home Charges இன் ஒரு கூறு","போர் செலவுகளும் கடன்களின் வட்டியும்"),
(275,"charge","One component of Home Charges","Railroad construction loan interest","Home Charges இன் ஒரு கூறு","இருப்புப்பாதை கட்டுமானக் கடன் வட்டி"),
(275,"debt","India's loan to England in 1837","130 million pounds","1837இல் இங்கிலாந்திற்கு இந்தியாவின் கடன்","130 மில்லியன் பவுண்டுகள்"),
(275,"debt","Later level to which India's loan rose","220 million pounds","இந்தியாவின் கடன் பின்னர் உயர்ந்த அளவு","220 மில்லியன் பவுண்டுகள்"),
(275,"share","Share of that debt attributed to wars against Afghanistan and Burma","18 percent","ஆப்கானிஸ்தான் மற்றும் பர்மா போர்களுக்குக் கூறப்பட்ட கடன் பங்கு","18 சதவீதம்"),
(275,"date","Year of government report on railway debt","1908","இருப்புப்பாதை கடன் குறித்து அரசு அறிக்கை வெளியான ஆண்டு","1908"),
(275,"debt","Railway-related debt cited in 1908 report","177.5 million pounds","1908 அறிக்கையில் கூறப்பட்ட இருப்புப்பாதை தொடர்பான கடன்","177.5 மில்லியன் பவுண்டுகள்"),
(275,"interest","Guaranteed interest promised on British private capital","5 percent","பிரிட்டிஷ் தனியார் முதலுக்கு உறுதி செய்யப்பட்ட வட்டி","5 சதவீதம்"),
(275,"loss","Loss to India attributed to guaranteed interest arrangement","220 million pounds","உறுதி வட்டி முறையால் இந்தியாவுக்கு ஏற்பட்டதாகக் கூறப்பட்ட இழப்பு","220 மில்லியன் பவுண்டுகள்"),
(275,"comparison","Historical raider Naoroji contrasted with continuing British drain","Mahmud of Ghazni","தொடர்ந்த பிரிட்டிஷ் சுரண்டலுடன் நௌரோஜி ஒப்பிட்ட வரலாற்றுப் படையெடுப்பாளர்","கஜினி மக்மூத்"),
(275,"number","Number of times Mahmud of Ghazni's plunder was said to have stopped after","Eighteen","கஜினி மக்மூதின் கொள்ளை நிறுத்தப்பட்டதாகக் கூறப்பட்ட முறை எண்ணிக்கை","பதினெட்டு"),
(275,"person","Economic historian estimating drain during Queen Victoria's last decade","R.C. Dutt","விக்டோரியா மகாராணியின் கடைசி தசாப்தத்தில் செல்வச் சுரண்டலை மதிப்பிட்டவர்","ஆர்.சி. தத்"),
(275,"period","Queen Victoria's last decade used by R.C. Dutt","1891–1901","ஆர்.சி. தத் பயன்படுத்திய விக்டோரியாவின் கடைசி தசாப்தம்","1891–1901"),
(275,"income","Total income figure cited by R.C. Dutt","647 million pounds","ஆர்.சி. தத் குறிப்பிட்ட மொத்த வருவாய்","647 மில்லியன் பவுண்டுகள்"),
(275,"drain","Amount said by R.C. Dutt to have drained to England","159 million pounds","ஆர்.சி. தத் இங்கிலாந்திற்கு சென்றதாகக் கூறிய தொகை","159 மில்லியன் பவுண்டுகள்"),
]

def norm(s): return " ".join(str(s).split()).strip()

facts=[]; seen=set()
for row in F:
    p,k,de,ae,dt,at=row
    key=(norm(de).lower(),norm(ae).lower())
    if key in seen: continue
    seen.add(key)
    facts.append({"page_en":p,"kind":k,"desc_en":norm(de),"ans_en":norm(ae),"desc_ta":norm(dt),"ans_ta":norm(at)})

pools=defaultdict(list)
for f in facts: pools[f["kind"]].append(f)

def distractors(f,n=3):
    cand=[x for x in pools[f["kind"]] if x["ans_en"].lower()!=f["ans_en"].lower()]
    cand.sort(key=lambda x:(abs(x["page_en"]-f["page_en"]),x["ans_en"]))
    out=[]; used=set()
    for x in cand:
        a=x["ans_en"].lower()
        if a not in used:
            out.append(x); used.add(a)
        if len(out)==n: break
    if len(out)<n:
        for x in facts:
            a=x["ans_en"].lower()
            if a!=f["ans_en"].lower() and a not in used:
                out.append(x); used.add(a)
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
      "id":f"C11H17-Q{qid:04d}",
      "quiz":(qid-1)//20+1,
      "page_en":page,
      "q_en":qen,"q_ta":qta,
      "opts_en":oe,"opts_ta":ot,
      "correct":c,"exp_en":een,"exp_ta":eta,"type":typ
    })
    qid+=1

for i,f in enumerate(facts):
    een=f'{f["desc_en"]}: {f["ans_en"]}.'
    eta=f'{f["desc_ta"]}: {f["ans_ta"]}.'
    templates=[
      ("direct","What is the correct textbook answer for: ","இதற்கான சரியான பாடநூல் விடை எது: "),
      ("association","Which option is correctly associated with the following description: ","பின்வரும் விளக்கத்துடன் சரியாகப் பொருந்தும் விடை எது: "),
      ("recognition","Identify the term/person/place that the textbook links with this fact: ","இந்த பாடநூல் உண்மையுடன் தொடர்புடைய பெயர்/சொல்/இடத்தைத் தேர்ந்தெடுக்கவும்: ")
    ]
    for j,(typ,pfx_en,pfx_ta) in enumerate(templates):
        oe,ot,c=make_opts(f,17000+i*41+j*100003)
        add(f["page_en"],pfx_en+f["desc_en"]+"?",pfx_ta+f["desc_ta"]+"?",oe,ot,c,een,eta,typ)

comb_en=["Both I and II are correct","I is correct; II is incorrect","I is incorrect; II is correct","Both I and II are incorrect"]
comb_ta=["I மற்றும் II இரண்டும் சரி","I சரி; II தவறு","I தவறு; II சரி","I மற்றும் II இரண்டும் தவறு"]
for i,f in enumerate(facts):
    g=facts[(i+1)%len(facts)]
    mode=i%4
    iok=mode in (0,1); iiok=mode in (0,2)
    wf=distractors(f,1)[0]; wg=distractors(g,1)[0]
    a1=f["ans_en"] if iok else wf["ans_en"]; t1=f["ans_ta"] if iok else wf["ans_ta"]
    a2=g["ans_en"] if iiok else wg["ans_en"]; t2=g["ans_ta"] if iiok else wg["ans_ta"]
    qen=f'Consider the following statements:\nI. {f["desc_en"]} — {a1}.\nII. {g["desc_en"]} — {a2}.\nWhich option is correct?'
    qta=f'பின்வரும் கூற்றுகளைக் கவனிக்கவும்:\nI. {f["desc_ta"]} — {t1}.\nII. {g["desc_ta"]} — {t2}.\nசரியான விடை எது?'
    exen=["Both Statement I and Statement II are correct.","Statement I is correct and Statement II is incorrect.","Statement I is incorrect and Statement II is correct.","Both Statement I and Statement II are incorrect."][mode]
    exta=["கூற்று I மற்றும் II இரண்டும் சரி.","கூற்று I சரி; கூற்று II தவறு.","கூற்று I தவறு; கூற்று II சரி.","கூற்று I மற்றும் II இரண்டும் தவறு."][mode]
    add(max(f["page_en"],g["page_en"]),qen,qta,comb_en,comb_ta,mode,exen,exta,"statement-analysis")

unique=[]; sigs=set()
for q in questions:
    s=(q["q_en"],tuple(q["opts_en"]))
    if s in sigs: continue
    sigs.add(s); unique.append(q)
questions=unique
for i,q in enumerate(questions,1):
    q["id"]=f"C11H17-Q{i:04d}"
    q["quiz"]=(i-1)//20+1

quiz_count=(len(questions)+19)//20
sets=[{"id":i,"title_en":f"Quiz {i} · Competitive Review","title_ta":f"வினாடி வினா {i} · போட்டித் தேர்வு மீள்பார்வை"} for i in range(1,quiz_count+1)]
counts=Counter("ABCD"[q["correct"]] for q in questions)
dups=len(questions)-len({(q["q_en"],tuple(q["opts_en"])) for q in questions})

out={"meta":{
  "board":"Tamil Nadu State Board","class":11,"subject":"History","edition":2025,"unit":17,
  "unit_en":"Effects of British Rule","unit_ta":"ஆங்கிலேயர் ஆட்சியின் விளைவுகள்",
  "source":"Government of Tamil Nadu Higher Secondary First Year History, Revised Edition 2025, English and Tamil editions supplied by the user",
  "total_questions":len(questions),"base_facts":len(facts),"quiz_sets":sets,
  "question_style":"Maximum useful source-grounded bilingual competitive-exam coverage from Unit 17: Buxar and Dual Government; Permanent, Ryotwari and Mahalwari land systems; Thomas Munro; Subsidiary Alliance and Doctrine of Lapse; British paramountcy over native states; civil, judicial and police reforms; training of Company servants; education policy; Pindaris, Thuggee and Sati; railways, telegraph, irrigation and forests; deindustrialization; famines, indentured labour and Drain of Wealth.",
  "quality_policy":"Four-option bilingual MCQs grounded in the supplied 2025 English and Tamil textbooks. Activities and low-value procedural material are excluded. Distinct examinable textbook facts are reinforced through direct recall, association, recognition and statement-analysis formats. Where the English and Tamil editions differ numerically, conflicting figures are not converted into a single bilingual fact.",
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
