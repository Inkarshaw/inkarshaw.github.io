import json, random, os
from collections import defaultdict, Counter

OUT="data/textbook/class-11/history/unit-12.json"
random.seed(1202026)

# (page_en, kind, description_en, answer_en, description_ta, answer_ta)
F=[
(175,"dynasty","Rulers of Devagiri at the beginning of the fourteenth century","Yadavas","பதினான்காம் நூற்றாண்டின் தொடக்கத்தில் தேவகிரியை ஆண்டவர்கள்","யாதவர்கள்"),
(175,"place","Capital of the Hoysalas","Dvarasamudra","ஹொய்சாளர்களின் தலைநகரம்","துவாரசமுத்திரம்"),
(175,"dynasty","Rulers of Dvarasamudra in Karnataka","Hoysalas","கர்நாடகத்தின் துவாரசமுத்திரத்தை ஆண்டவர்கள்","ஹொய்சாளர்கள்"),
(175,"place","Capital of the Kakatiyas","Warangal","காகதீயர்களின் தலைநகரம்","வாரங்கல்"),
(175,"dynasty","Rulers of Warangal in the eastern part of present Telangana","Kakatiyas","இன்றைய தெலங்கானாவின் கிழக்குப் பகுதியில் வாரங்கலை ஆண்டவர்கள்","காகதீயர்கள்"),
(175,"place","Capital of the Pandyas in southern Tamil Nadu","Madurai","தென் தமிழ்நாட்டில் பாண்டியர்களின் தலைநகரம்","மதுரை"),
(175,"event","General who led major Delhi Sultanate expeditions into the south","Malik Kafur","தெற்கே டெல்லி சுல்தானியத்தின் முக்கிய படையெடுப்புகளை வழிநடத்திய தளபதி","மாலிக் காபூர்"),
(175,"date","Year of Malik Kafur's first southern expedition mentioned in the textbook","1304","பாடநூலில் குறிப்பிடப்பட்ட மாலிக் காபூரின் முதல் தென்னிந்தியப் படையெடுப்பு ஆண்டு","1304"),
(175,"date","Year of Malik Kafur's second southern expedition mentioned in the textbook","1310","பாடநூலில் குறிப்பிடப்பட்ட மாலிக் காபூரின் இரண்டாவது தென்னிந்தியப் படையெடுப்பு ஆண்டு","1310"),
(175,"ruler","Delhi Sultan who tried to make Devagiri his capital","Muhammad Tughluq","தேவகிரியைத் தலைநகரமாக்க முயன்ற டெல்லி சுல்தான்","முகமது துக்ளக்"),
(175,"date","Reign period of Muhammad Tughluq given in the textbook","1325–1351","பாடநூலில் கொடுக்கப்பட்ட முகமது துக்ளக்கின் ஆட்சிக்காலம்","1325–1351"),
(175,"place","New name given to Devagiri by Muhammad Tughluq","Daulatabad","முகமது துக்ளக் தேவகிரிக்கு வைத்த புதிய பெயர்","தௌலதாபாத்"),
(175,"date","Year Madurai became an independent Sultanate","1333","மதுரை சுதந்திர சுல்தானியமாக மாறிய ஆண்டு","1333"),
(175,"person","Leader who declared independence at Devagiri in 1345 and later became Bahman Shah","Zafar Khan","1345இல் தேவகிரியில் சுதந்திரத்தை அறிவித்து பின்னர் பாமன் ஷா ஆனவர்","ஜாபர் கான்"),
(175,"date","Year Zafar Khan declared independence at Devagiri","1345","ஜாபர் கான் தேவகிரியில் சுதந்திரத்தை அறிவித்த ஆண்டு","1345"),
(175,"place","Capital to which Zafar Khan shifted after declaring independence","Gulbarga","சுதந்திரத்தை அறிவித்த பின் ஜாபர் கான் தலைநகரை மாற்றிய இடம்","குல்பர்கா"),
(175,"title","Title assumed by Zafar Khan","Bahman Shah","ஜாபர் கான் ஏற்ற பட்டம்","பாமன் ஷா"),
(175,"date","Period of the Bahmani dynasty given in the textbook","1347–1527","பாடநூலில் கொடுக்கப்பட்ட பாமினி வம்சத்தின் காலம்","1347–1527"),
(175,"date","Approximate year of the foundation of Vijayanagar","1336","விஜயநகர அரசு நிறுவப்பட்ட சுமார் ஆண்டு","1336"),
(175,"person","Founders of the Vijayanagar kingdom","Harihara and Bukka","விஜயநகர அரசை நிறுவியவர்கள்","ஹரிஹரர் மற்றும் புக்கர்"),
(175,"place","Present-day site of Vijayanagara mentioned in the textbook","Hampi","பாடநூலில் விஜயநகரத்தின் இன்றைய இடமாக குறிப்பிடப்பட்டது","ஹம்பி"),
(175,"region","Bank of the Tungabhadra on which Vijayanagara was established","South bank","விஜயநகரம் நிறுவப்பட்ட துங்கபத்ரா ஆற்றின் கரை","தெற்குக் கரை"),
(175,"region","Fertile tract fought over by Bahmani and Vijayanagar","Raichur Doab","பாமினி மற்றும் விஜயநகர அரசுகள் மோதிய வளமான பகுதி","ராய்ச்சூர் இரு ஆற்றிடைப் பகுதி"),
(175,"river","Rivers enclosing the Raichur Doab","Krishna and Tungabhadra","ராய்ச்சூர் இரு ஆற்றிடைப் பகுதியைச் சூழ்ந்த ஆறுகள்","கிருஷ்ணா மற்றும் துங்கபத்ரா"),
(175,"place","West-coast port named as a horse-supply point for the armies","Goa","படைகளுக்கான குதிரை விநியோக மையமாகக் குறிப்பிடப்பட்ட மேற்குக் கடற்கரைத் துறைமுகம்","கோவா"),
(175,"place","Another west-coast horse-supply port mentioned with Goa","Honavar","கோவாவுடன் சேர்த்து குறிப்பிடப்பட்ட மற்றொரு குதிரை விநியோகத் துறைமுகம்","ஹொன்னாவர்"),

(176,"source","Type of Bahmani source written by court historians","Persian accounts","பாமினி அரசவைக் வரலாற்றாசிரியர்கள் எழுதிய ஆதார வகை","பாரசீகக் குறிப்புகள்"),
(176,"source","Information supplied by Persian court accounts that inscriptions often lack","Eye-witness accounts of battles and palace intrigues","கல்வெட்டுகளில் குறைவாகக் காணப்படும் பாரசீக அரசவைக் குறிப்புகளின் தகவல்","போர்களும் அரண்மனைச் சூழ்ச்சிகளும் குறித்த நேரடி சாட்சியங்கள்"),
(176,"work","Kannada-Telugu literary work mentioned as a Vijayanagar source","Manucharitram","விஜயநகர ஆதாரமாகக் குறிப்பிடப்பட்ட கன்னட-தெலுங்கு இலக்கிய நூல்","மனுசரித்ரம்"),
(176,"work","Another literary source patronised in the Vijayanagar court","Saluvabhyudayam","விஜயநகர அரசவையில் ஆதரிக்கப்பட்ட மற்றொரு இலக்கிய ஆதாரம்","சாளுவாப்யுதயம்"),
(176,"work","Telugu work giving details of the Nayankara system under Krishnadevaraya","Rayavachakamu","கிருஷ்ணதேவராயரின் நாயக்கர் முறையை விவரிக்கும் தெலுங்கு நூல்","ராயவாசகமு"),
(176,"traveller","Moroccan traveller cited for the period","Ibn Battuta","இக்காலத்திற்கான மொராக்கோப் பயணி","இப்னு பதூதா"),
(176,"date","Period associated with Ibn Battuta in the textbook","1333–1345","பாடநூலில் இப்னு பதூதாவுடன் தொடர்புடைய காலம்","1333–1345"),
(176,"traveller","Persian visitor cited for Vijayanagar","Abdur Razzak","விஜயநகரத்துடன் தொடர்புடைய பாரசீகப் பயணி","அப்துர் ரசாக்"),
(176,"date","Period associated with Abdur Razzak","1443–1445","அப்துர் ரசாக்குடன் தொடர்புடைய காலம்","1443–1445"),
(176,"traveller","Russian traveller cited for the period","Nikitin","இக்காலத்திற்கான ரஷ்யப் பயணி","நிகிடின்"),
(176,"date","Period associated with Nikitin","1470–1474","நிகிடினுடன் தொடர்புடைய காலம்","1470–1474"),
(176,"traveller","Portuguese visitors cited together in the textbook","Domingo Paes and Nuniz","பாடநூலில் ஒன்றாகக் குறிப்பிடப்பட்ட போர்த்துகீசியப் பயணிகள்","டொமிங்கோ பயஸ் மற்றும் நூனிஸ்"),
(176,"date","Period associated with Domingo Paes and Nuniz","1520–1537","டொமிங்கோ பயஸ் மற்றும் நூனிஸுடன் தொடர்புடைய காலம்","1520–1537"),
(176,"language","Languages of the thousands of inscriptions available for this period","Kannada, Tamil and Telugu","இக்காலத்தில் கிடைக்கும் ஆயிரக்கணக்கான கல்வெட்டுகளின் மொழிகள்","கன்னடம், தமிழ் மற்றும் தெலுங்கு"),
(176,"language","Language of many copper-plate charters","Sanskrit","பல செப்பேடுகளின் மொழி","சமஸ்கிருதம்"),
(176,"source","Material remains including temples, palaces, forts and mosques are classified as","Archaeological sources","கோவில்கள், அரண்மனைகள், கோட்டைகள், பள்ளிவாசல்கள் போன்றவை எந்த வகை ஆதாரங்கள்","தொல்லியல் ஆதாரங்கள்"),
(176,"source","Evidence based on coins","Numismatic evidence","நாணயங்களை அடிப்படையாகக் கொண்ட ஆதாரம்","நாணயவியல் ஆதாரம்"),
(176,"ruler","Founder-ruler of the Bahmani kingdom discussed first in the chapter","Alaudin Hasan Bahman Shah","அத்தியாயத்தில் முதலில் விவாதிக்கப்படும் பாமினி நிறுவனர் அரசர்","அலாவுதீன் ஹசன் பாமன் ஷா"),
(176,"date","Reign of Alauddin Hasan Bahman Shah","1347–1358","அலாவுதீன் ஹசன் பாமன் ஷாவின் ஆட்சிக்காலம்","1347–1358"),
(176,"region","Eastern power with which Bahman Shah had to contend","Warangal","பாமன் ஷா கிழக்கில் எதிர்கொண்ட முக்கிய அரசு","வாரங்கல்"),
(176,"region","Another eastern power with which Bahman Shah had to contend","Orissa","பாமன் ஷா கிழக்கில் எதிர்கொண்ட மற்றொரு அரசு","ஒரிசா"),
(176,"term","Bahmani territorial administrative divisions under Bahman Shah","Tarafs","பாமன் ஷா கால பாமினி நில நிர்வாகப் பிரிவுகள்","தரஃப்கள்"),
(176,"number","Number of original Bahmani tarafs under Bahman Shah","Four","பாமன் ஷா கால ஆரம்ப பாமினி தரஃப்களின் எண்ணிக்கை","நான்கு"),
(176,"place","One of the four original Bahmani provinces","Gulbarga","ஆரம்ப நான்கு பாமினி மாகாணங்களில் ஒன்று","குல்பர்கா"),
(176,"place","One of the four original Bahmani provinces","Daulatabad","ஆரம்ப நான்கு பாமினி மாகாணங்களில் ஒன்று","தௌலதாபாத்"),
(176,"place","One of the four original Bahmani provinces","Bidar","ஆரம்ப நான்கு பாமினி மாகாணங்களில் ஒன்று","பீதார்"),
(176,"place","One of the four original Bahmani provinces","Berar","ஆரம்ப நான்கு பாமினி மாகாணங்களில் ஒன்று","பெரார்"),
(176,"function","Responsibility of a Bahmani taraf governor besides administration","Revenue collection","நிர்வாகத்துடன் பாமினி தரஃப் ஆளுநரின் பொறுப்பு","வருவாய் வசூல்"),
(176,"function","Military role of a Bahmani provincial governor","Commanded the army of his province","பாமினி மாகாண ஆளுநரின் இராணுவப் பங்கு","தன் மாகாணப் படையை வழிநடத்துதல்"),
(176,"region","State from which Bahman Shah attempted to exact annual tribute","Warangal","பாமன் ஷா ஆண்டுதோறும் கப்பம் பெற முயன்ற அரசு","வாரங்கல்"),
(176,"region","Reddi kingdom from which Bahman Shah attempted to exact tribute","Rajahmundry","பாமன் ஷா கப்பம் பெற முயன்ற ரெட்டி அரசு","ராஜமுந்திரி"),
(176,"region","Another Reddi kingdom from which Bahman Shah attempted to exact tribute","Kondavidu","பாமன் ஷா கப்பம் பெற முயன்ற மற்றொரு ரெட்டி அரசு","கொண்டவீடு"),
(176,"title","Title assumed by Bahman Shah on his coins after victories","Second Alexander","வெற்றிகளுக்குப் பின் பாமன் ஷா நாணயங்களில் எடுத்த பட்டம்","இரண்டாம் அலெக்சாண்டர்"),
(176,"coin","Gold coin issued in large numbers by Vijayanagar rulers","Varaha","விஜயநகர அரசர்கள் பெருமளவில் வெளியிட்ட தங்க நாணயம்","வராகம்"),
(176,"coin","Tamil name for the Vijayanagar gold Varaha","Pon","விஜயநகர தங்க வராகத்தின் தமிழ்ப் பெயர்","பொன்"),
(176,"coin","Kannada name for the Vijayanagar gold Varaha","Honnu","விஜயநகர தங்க வராகத்தின் கன்னடப் பெயர்","ஹொன்னு"),
(176,"symbol","Fabulous double-eagle motif seen on Vijayanagar coins","Gandaberunda","விஜயநகர நாணயங்களில் காணப்படும் இரட்டை கழுகுச் சின்னம்","கண்டபெருண்டா"),
(176,"script","Scripts used for the king's name on Vijayanagar gold coins","Nagari or Kannada","விஜயநகர தங்க நாணயங்களில் அரசரின் பெயர் எழுதப்பட்ட எழுத்துமுறைகள்","நாகரி அல்லது கன்னடம்"),

(177,"ruler","Successor of Bahman Shah","Mohammed I","பாமன் ஷாவுக்குப் பின் ஆட்சிக்கு வந்தவர்","முகமது I"),
(177,"date","Reign of Mohammed I","1358–1375","முகமது I ஆட்சிக்காலம்","1358–1375"),
(177,"region","Main region contested in Mohammed I's decade-long war with Vijayanagar","Raichur Doab","முகமது I கால விஜயநகரத்துடனான பத்து ஆண்டு போரின் முக்கிய பகுதி","ராய்ச்சூர் இரு ஆற்றிடைப் பகுதி"),
(177,"date","Year Mohammed I attacked Warangal","1363","முகமது I வாரங்கலைத் தாக்கிய ஆண்டு","1363"),
(177,"place","Fortress obtained by Mohammed I from Warangal","Golkonda","முகமது I வாரங்கலிலிருந்து பெற்ற கோட்டை","கோல்கொண்டா"),
(177,"object","Treasured royal seat obtained by Mohammed I from Warangal","Turquoise throne","முகமது I வாரங்கலிலிருந்து பெற்ற புகழ்பெற்ற அரச ஆசனம்","டர்காய்ஸ் அரியணை"),
(177,"work","Persian epic describing the turquoise throne","Shah Nama","டர்காய்ஸ் அரியணையை விவரிக்கும் பாரசீகக் காவியம்","ஷா நாமா"),
(177,"person","Author of Shah Nama","Firdausi","ஷா நாமாவின் ஆசிரியர்","பிர்தௌசி"),
(177,"number","Number of ministers in Mohammed I's council","Eight","முகமது I அமைச்சரவை உறுப்பினர்களின் எண்ணிக்கை","எட்டு"),
(177,"office","Immediate subordinate of the sovereign in Mohammed I's council","Vakil-us-sultana","முகமது I அமைச்சரவையில் அரசரின் உடனடி துணை அதிகாரி","வகீல்-உஸ்-சுல்தானா"),
(177,"office","Minister who supervised the work of all other ministers","Wazir-i-kull","மற்ற அமைச்சர்களின் பணியை மேற்பார்வையிட்ட அமைச்சர்","வசீர்-இ-குல்"),
(177,"office","Bahmani minister of finance","Amir-i-jumla","பாமினி நிதி அமைச்சர்","அமீர்-இ-ஜும்லா"),
(177,"office","Minister of foreign affairs and master of ceremonies","Wasir-i-ashraf","வெளிநாட்டு விவகார அமைச்சர் மற்றும் விழா மேற்பார்வையாளர்","வசீர்-இ-அஷ்ரப்"),
(177,"office","Assistant minister for finance","Nazir","நிதித்துறை உதவி அமைச்சர்","நாசிர்"),
(177,"office","Minister associated with the lieutenant of the kingdom","Peshwa","அரசின் துணை அதிகாரியுடன் இணைந்து பணியாற்றிய அமைச்சர்","பேஷ்வா"),
(177,"office","Chief of police and city magistrate in the Bahmani capital","Kotwal","பாமினி தலைநகரின் காவல் தலைவர் மற்றும் நகர நீதிபதி","கோத்வால்"),
(177,"office","Chief justice and minister of religious affairs and endowments","Sadr-i-jahan","தலைமை நீதிபதி மற்றும் சமய விவகார, அறக்கட்டளை அமைச்சர்","சத்ர்-இ-ஜஹான்"),
(177,"policy","Crime strongly suppressed by Mohammed I","Highway robbery","முகமது I கடுமையாக ஒடுக்கிய குற்றம்","நெடுஞ்சாலை கொள்ளை"),
(177,"place","City where Mohammed I built two mosques","Gulbarga","முகமது I இரண்டு பள்ளிவாசல்கள் கட்டிய நகரம்","குல்பர்கா"),
(177,"date","Year the great mosque at Gulbarga was completed","1367","குல்பர்கா பெரிய பள்ளிவாசல் முடிக்கப்பட்ட ஆண்டு","1367"),
(177,"date","Year Warangal was subdued by the Bahmanis","1425","வாரங்கல் பாமினிகளால் அடக்கப்பட்ட ஆண்டு","1425"),
(177,"region","Power that challenged Bahmani expansion further east after Warangal","Orissa","வாரங்கலுக்குப் பின் பாமினி கிழக்கு விரிவைத் தடுத்த அரசு","ஒரிசா"),
(177,"date","Year the Bahmani capital was shifted from Gulbarga to Bidar","1429","பாமினி தலைநகர் குல்பர்காவிலிருந்து பீதாருக்கு மாற்றப்பட்ட ஆண்டு","1429"),
(177,"ruler","Bahmani ruler whose reign is noted for Mohammed Gawan","Mohammad III","முகமது கவானால் புகழ்பெற்ற பாமினி அரசர்","முகமது III"),
(177,"date","Reign of Mohammad III","1463–1482","முகமது III ஆட்சிக்காலம்","1463–1482"),
(177,"person","Great Bahmani statesman and prime minister under Mohammad III","Mohammed Gawan","முகமது III கீழ் பணியாற்றிய சிறந்த பாமினி அரசியல்வாதி மற்றும் பிரதமர்","முகமது கவான்"),
(177,"origin","Birthplace/ethnic origin of Mohammed Gawan","Persian","முகமது கவானின் பூர்வீகம்","பாரசீகன்"),
(177,"subject","One field in which Mohammed Gawan was well versed","Islamic theology","முகமது கவான் நன்கு அறிந்திருந்த ஒரு துறை","இஸ்லாமிய இறையியல்"),
(177,"subject","Another field in which Mohammed Gawan was well versed","Mathematics","முகமது கவான் நன்கு அறிந்திருந்த மற்றொரு துறை","கணிதம்"),
(177,"place","Location of Mohammed Gawan Madrasa","Bidar","முகமது கவான் மதரசா அமைந்த இடம்","பீதார்"),
(177,"number","Number of manuscripts in the Mohammed Gawan Madrasa library","3000","முகமது கவான் மதரசா நூலகத்தில் இருந்த கையெழுத்துப் பிரதிகளின் எண்ணிக்கை","3000"),
(177,"region","One region against whose rulers Gawan fought successfully","Konkan","கவான் வெற்றிகரமாகப் போரிட்ட பகுதிகளில் ஒன்று","கொங்கண்"),
(177,"region","Another power defeated by Gawan","Orissa","கவான் வெற்றிகரமாகப் போரிட்ட மற்றொரு அரசு","ஒரிசா"),
(177,"region","Kingdom against which Gawan used gunpowder at Belgaum","Vijayanagar","பெல்காமில் கவான் வெடிமருந்தைப் பயன்படுத்திய எதிரி அரசு","விஜயநகரம்"),
(177,"technology","Technology taught by Persian chemists employed by Gawan","Preparation and use of gunpowder","கவான் பணியமர்த்திய பாரசீக வேதியியலாளர்கள் கற்றுக்கொடுத்த தொழில்நுட்பம்","வெடிமருந்து தயாரித்தலும் பயன்படுத்தலும்"),
(177,"number","Number of Bahmani provinces after Gawan's reorganisation","Eight","கவானின் மறுசீரமைப்புக்குப் பின் பாமினி மாகாணங்களின் எண்ணிக்கை","எட்டு"),
(177,"number","Maximum number of forts a provincial governor was allowed to control under Gawan","One","கவான் காலத்தில் ஒரு மாகாண ஆளுநர் கட்டுப்படுத்த அனுமதிக்கப்பட்ட கோட்டைகளின் அதிகபட்ச எண்ணிக்கை","ஒன்று"),
(177,"policy","Authority that directly controlled the remaining forts under Gawan","The Sultan","கவான் காலத்தில் மீதமுள்ள கோட்டைகளை நேரடியாகக் கட்டுப்படுத்தியவர்","சுல்தான்"),
(177,"policy","Officials receiving land assignments as pay were made accountable for","Income and expenditure","ஊதியமாக நில ஒதுக்கீடு பெற்ற அதிகாரிகள் கணக்கு கொடுக்க வேண்டியது","வருமானமும் செலவுமும்"),
(177,"group","Provincial chiefs whose powers were curtailed by Gawan's reforms","Deccanis","கவானின் சீர்திருத்தங்களால் அதிகாரம் குறைக்கப்பட்ட மாகாணத் தலைவர்கள்","தக்காணிகள்"),
(177,"group","Foreign Muslim noble group opposed to the Deccanis","Pardesis","தக்காணிகளுக்கு எதிராக இருந்த வெளிநாட்டு முஸ்லிம் பிரபுக்கள்","பரதேசிகள்"),

(178,"event","Immediate cause used to implicate Gawan in conspiracy","A forged letter","கவானைச் சதியில் சிக்கவைக்கப் பயன்படுத்தப்பட்ட உடனடி காரணம்","போலிக் கடிதம்"),
(178,"event","Fate of Mohammed Gawan after the forged conspiracy charge","Execution by order of the Sultan","போலிச் சதி குற்றச்சாட்டுக்குப் பின் முகமது கவானுக்கு ஏற்பட்ட முடிவு","சுல்தானின் ஆணையால் மரணதண்டனை"),
(178,"result","Major consequence of Gawan's execution","Disintegration of the Bahmani Sultanate","கவானின் மரணதண்டனையின் முக்கிய விளைவு","பாமினி சுல்தானியத்தின் சிதைவு"),
(178,"dynasty","Dynasty of Raja Krishna Dev who originally constructed Golkonda Fort","Kakatiya dynasty","கோல்கொண்டா கோட்டையை முதலில் கட்டிய ராஜா கிருஷ்ண தேவின் வம்சம்","காகதீய வம்சம்"),
(178,"place","Capital of the Kakatiya dynasty connected with Raja Krishna Dev","Warangal","ராஜா கிருஷ்ண தேவுடன் தொடர்புடைய காகதீய தலைநகரம்","வாரங்கல்"),
(178,"material","Hill material on which Golkonda Fort was constructed","Granite","கோல்கொண்டா கோட்டை அமைந்த மலைக்கல்","கிரானைட்"),
(178,"date","Period when Golkonda was handed over as a jagir to Sultan Kali Kutub Khan","1495–1496","கோல்கொண்டா சுல்தான் கலி குதுப் கானுக்கு ஜாகீராக ஒப்படைக்கப்பட்ட காலம்","1495–1496"),
(178,"term","Land grant through which Golkonda was handed to Sultan Kali Kutub Khan","Jagir","கோல்கொண்டா சுல்தான் கலி குதுப் கானுக்கு ஒப்படைக்கப்பட்ட நிலமானிய முறை","ஜாகீர்"),
(178,"place","New name given to Golkonda by Sultan Kali Kutub Khan","Muhammed Nagar","சுல்தான் கலி குதுப் கான் கோல்கொண்டாவுக்கு வைத்த புதிய பெயர்","முகமது நகர்"),
(178,"dynasty","Dynasty that later made Golkonda its capital","Qutub Shahi dynasty","பின்னர் கோல்கொண்டாவைத் தலைநகரமாக்கிய வம்சம்","குதுப் ஷாஹி வம்சம்"),
(178,"ruler","Fifth Qutb Shahi sultan credited with much of Golkonda's grandeur","Mohammad Quli Qutub Shah","கோல்கொண்டாவின் பெருமைக்கு முக்கிய பங்காற்றிய ஐந்தாவது குதுப் ஷாஹி சுல்தான்","முகமது குலி குதுப் ஷா"),
(178,"century","Century in which Golkonda became famous as a diamond market","Seventeenth century","கோல்கொண்டா வைர சந்தையாகப் புகழ்பெற்ற நூற்றாண்டு","பதினேழாம் நூற்றாண்டு"),
(178,"diamond","Famous diamond associated with Golkonda","Kohinoor","கோல்கொண்டாவுடன் தொடர்புடைய புகழ்பெற்ற வைரம்","கோஹினூர்"),
(178,"distance","Approximate distance of Golkonda Fort from Hyderabad","11 km","ஹைதராபாத்திலிருந்து கோல்கொண்டா கோட்டையின் சுமார் தூரம்","11 கி.மீ."),
(178,"height","Height of the hill on which Golkonda Fort stands","120 metres","கோல்கொண்டா கோட்டை அமைந்துள்ள மலையின் உயரம்","120 மீட்டர்"),
(178,"feature","Architectural feature for which Golkonda Fort is popular","Acoustic architecture","கோல்கொண்டா கோட்டை புகழ்பெற்ற கட்டிடக்கலை அம்சம்","ஒலியியல் கட்டிடக்கலை"),
(178,"place","Highest point of Golkonda Fort","Bala Hissar","கோல்கொண்டா கோட்டையின் உயர்ந்த பகுதி","பாலா ஹிஸார்"),
(178,"feature","Secret passage said to connect the Durbar Hall with a palace","Underground tunnel","தர்பார் மண்டபத்தையும் அரண்மனையையும் இணைத்ததாகக் கூறப்படும் ரகசியப் பாதை","பாதாள சுரங்கப்பாதை"),
(178,"gate","Victory Gate of Golkonda Fort","Fateh Darwaza","கோல்கொண்டா கோட்டையின் வெற்றி வாயில்","பதே தர்வாசா"),
(178,"ruler","Mughal ruler who besieged Golkonda in 1687","Aurangzeb","1687இல் கோல்கொண்டாவை முற்றுகையிட்ட முகலாய அரசர்","அவுரங்கசீப்"),
(178,"date","Year of Aurangzeb's siege of Golkonda","1687","அவுரங்கசீப்பின் கோல்கொண்டா முற்றுகை ஆண்டு","1687"),
(178,"duration","Approximate duration of Aurangzeb's siege of Golkonda","Eight months","அவுரங்கசீப்பின் கோல்கொண்டா முற்றுகையின் சுமார் காலம்","எட்டு மாதங்கள்"),
(178,"cause","Immediate reason the supposedly impregnable Golkonda finally fell","Treachery of an Afghan gatekeeper","கோல்கொண்டா இறுதியில் வீழ்ந்த உடனடி காரணம்","ஆப்கான் வாயில்காவலரின் துரோகம்"),
(178,"place","City containing the Jami Masjid cited as Bahmani architecture","Gulbarga","பாமினி கட்டிடக்கலையின் ஜாமி மசூதி அமைந்த நகரம்","குல்பர்கா"),
(178,"place","City containing Golgumbaz cited in the chapter","Bijapur","அத்தியாயத்தில் குறிப்பிடப்பட்ட கோல்கும்பாஸ் அமைந்த நகரம்","பிஜாப்பூர்"),
(178,"place","City containing Chand Minar cited in the chapter","Bidar","அத்தியாயத்தில் குறிப்பிடப்பட்ட சந்த் மினார் அமைந்த நகரம்","பீதார்"),
(178,"style","Architectural style developed by the Bahmani Sultans","Indo-Saracenic style","பாமினி சுல்தான்கள் வளர்த்த கட்டிடக்கலை பாணி","இந்தோ-சாரசனிக் பாணி"),

(179,"number","Number of Bahmani successor states after the Sultanate's breakup","Five","பாமினி சுல்தானியம் சிதைந்த பின் உருவான வாரிசு அரசுகளின் எண்ணிக்கை","ஐந்து"),
(179,"state","One of the Deccan Sultanates emerging from Bahmani breakup","Bijapur","பாமினி சிதைவிலிருந்து உருவான தக்காண சுல்தானியங்களில் ஒன்று","பிஜாப்பூர்"),
(179,"state","One of the Deccan Sultanates emerging from Bahmani breakup","Ahmadnagar","பாமினி சிதைவிலிருந்து உருவான தக்காண சுல்தானியங்களில் ஒன்று","அகமத்நகர்"),
(179,"state","One of the Deccan Sultanates emerging from Bahmani breakup","Berar","பாமினி சிதைவிலிருந்து உருவான தக்காண சுல்தானியங்களில் ஒன்று","பெரார்"),
(179,"state","One of the Deccan Sultanates emerging from Bahmani breakup","Golkonda","பாமினி சிதைவிலிருந்து உருவான தக்காண சுல்தானியங்களில் ஒன்று","கோல்கொண்டா"),
(179,"state","Fifth successor state where the Bahmani Sultan became a puppet","Bidar","பாமினி சுல்தான் பொம்மை அரசராக இருந்த ஐந்தாவது வாரிசு அரசு","பீதார்"),
(179,"state","Successor Sultanate that became powerful by annexing Bidar and Berar","Bijapur","பீதார் மற்றும் பெராரை இணைத்து வலுவடைந்த வாரிசு சுல்தானியம்","பிஜாப்பூர்"),
(179,"battle","Battle in which Vijayanagar was decisively routed in 1565","Talikota or Rakshasi-Tangadi","1565இல் விஜயநகரம் தீர்மானமாகத் தோற்கடிக்கப்பட்ட போர்","தாலிகோட்டா அல்லது ராட்சசி-தங்கடி"),
(179,"date","Year of the Battle of Talikota","1565","தாலிகோட்டா போரின் ஆண்டு","1565"),
(179,"empire","Power that eventually conquered the Deccan Sultanates","Mughal state","பின்னர் தக்காண சுல்தானியங்களை வென்ற பேரரசு","முகலாய அரசு"),

(180,"person","Father or forefather after whom the Sangama dynasty was named","Sangama","சங்கம வம்சம் பெயரிடப்பட்ட தந்தை அல்லது முன்னோர்","சங்கமர்"),
(180,"service","Rulers whom Harihara and Bukka had earlier served","Hoysalas of Karnataka","ஹரிஹரரும் புக்கரும் முன்பு சேவை செய்த அரசர்கள்","கர்நாடக ஹொய்சாளர்கள்"),
(180,"ruler","Hoysala king whose death preceded the foundation of Vijayanagar","Ballala III","விஜயநகரம் தோன்றுவதற்கு முன் இறந்த ஹொய்சாள அரசர்","மூன்றாம் பல்லாளர்"),
(180,"place","Power responsible for the death of Ballala III according to the textbook","Madurai Sultan","பாடநூலின்படி மூன்றாம் பல்லாளரின் மரணத்துக்கு காரணமான ஆட்சியாளர்","மதுரை சுல்தான்"),
(180,"place","Initial capital area of Vijayanagar on the north bank of Tungabhadra","Anegondi","துங்கபத்ராவின் வடகரையில் இருந்த விஜயநகரத்தின் ஆரம்பத் தலைநகர் பகுதி","அனெகொண்டி"),
(180,"place","Hoysala town near Hampi to which the capital was shifted","Hosapattana","ஹம்பி அருகே தலைநகரம் மாற்றப்பட்ட ஹொய்சாள நகரம்","ஹொசப்பட்டணா"),
(180,"meaning","Meaning of the name Vijayanagara","City of Victory","விஜயநகரம் என்ற பெயரின் பொருள்","வெற்றியின் நகரம்"),
(180,"date","Year of Harihara's coronation at Vijayanagara","1346","விஜயநகரத்தில் ஹரிஹரரின் முடிசூட்டு ஆண்டு","1346"),
(180,"symbol","Royal insignia adopted by Vijayanagar rulers from the Chalukyas","Varaha (boar)","சாளுக்கியர்களிடமிருந்து விஜயநகர அரசர்கள் ஏற்ற அரசச் சின்னம்","வராகம் (பன்றி)"),
(180,"person","Saiva saint and Sanskrit scholar later tradition links with Vijayanagar's foundation","Vidyaranya (Madhava)","விஜயநகரத் தோற்றத்துடன் பிற்கால மரபு இணைக்கும் சைவத் துறவி மற்றும் சமஸ்கிருத அறிஞர்","வித்யாரண்யர் (மாதவர்)"),
(180,"dynasty","First Vijayanagar dynasty","Sangama dynasty","விஜயநகரத்தின் முதல் வம்சம்","சங்கம வம்சம்"),
(180,"date","Period of Sangama dynasty","1336–1485","சங்கம வம்சத்தின் காலம்","1336–1485"),
(180,"dynasty","Second Vijayanagar dynasty","Saluva dynasty","விஜயநகரத்தின் இரண்டாவது வம்சம்","சாளுவ வம்சம்"),
(180,"date","Period of Saluva dynasty","1485–1505","சாளுவ வம்சத்தின் காலம்","1485–1505"),
(180,"dynasty","Third Vijayanagar dynasty","Tuluva dynasty","விஜயநகரத்தின் மூன்றாவது வம்சம்","துளுவ வம்சம்"),
(180,"date","Period of Tuluva dynasty","1505–1570","துளுவ வம்சத்தின் காலம்","1505–1570"),
(180,"dynasty","Fourth Vijayanagar dynasty","Aravidu dynasty","விஜயநகரத்தின் நான்காவது வம்சம்","ஆரவீடு வம்சம்"),
(180,"date","Period of Aravidu dynasty given in the textbook","1570–1650","பாடநூலில் கொடுக்கப்பட்ட ஆரவீடு வம்சத்தின் காலம்","1570–1650"),
(180,"number","Number of Sangama brothers mentioned as consolidating Vijayanagar","Five","விஜயநகரத்தை ஒருங்கிணைத்த சங்கம சகோதரர்களின் எண்ணிக்கை","ஐந்து"),
(180,"region","First major kingdom core incorporated into Vijayanagar","Hoysala core area in Karnataka","விஜயநகரத்தில் முதலில் இணைக்கப்பட்ட முக்கிய அரசுப் பகுதி","கர்நாடகத்தின் ஹொய்சாள மையப்பகுதி"),
(180,"region","Tamil region targeted under Bukka I","Tondai-mandalam","புக்கர் I காலத்தில் குறிவைக்கப்பட்ட தமிழ் பகுதி","தொண்டைமண்டலம்"),
(180,"chief","Chiefs ruling Tondai-mandalam when Vijayanagar advanced there","Sambuvarayas","விஜயநகரம் முன்னேறியபோது தொண்டைமண்டலத்தை ஆண்ட சிற்றரசர்கள்","சம்புவராயர்கள்"),
(180,"person","Prince who conquered Tondai-mandalam for Vijayanagar","Kumara Kampana","விஜயநகரத்துக்காக தொண்டைமண்டலத்தை வென்ற இளவரசர்","குமார கம்பணர்"),
(180,"relation","Relation of Kumara Kampana to Bukka I","Son","குமார கம்பணருக்கும் புக்கர் Iக்கும் உள்ள உறவு","மகன்"),
(180,"person","General who assisted Kumara Kampana","Maraya-Nayak","குமார கம்பணருக்கு உதவிய தளபதி","மாரய நாயக்"),
(180,"date","Approximate year Kumara Kampana ended the Madurai Sultanate","1370","குமார கம்பணர் மதுரை சுல்தானியத்தை முடிவுக்கு கொண்டுவந்த சுமார் ஆண்டு","1370"),
(180,"work","Sanskrit work describing Kampana's conquest of Madurai","Madura-vijayam","கம்பணரின் மதுரை வெற்றியை விவரிக்கும் சமஸ்கிருத நூல்","மதுரா விஜயம்"),
(180,"person","Author of Madura-vijayam","Gangadevi","மதுரா விஜயத்தின் ஆசிரியர்","கங்காதேவி"),
(180,"relation","Relation of Gangadevi to Kumara Kampana","Wife","கங்காதேவிக்கும் குமார கம்பணருக்கும் உள்ள உறவு","மனைவி"),

(181,"cause","Major issue in Vijayanagar–Bahmani conflict besides territory and tribute","Control of horse trade","நிலப்பகுதி மற்றும் கப்பத்துடன் விஜயநகர–பாமினி மோதலின் முக்கிய காரணம்","குதிரை வணிகக் கட்டுப்பாடு"),
(181,"region","River that remained roughly the dividing line between Vijayanagar and Bahmani powers","Krishna","விஜயநகரம் மற்றும் பாமினி அரசுகளுக்கு இடையே சுமார் எல்லையாக இருந்த ஆறு","கிருஷ்ணா"),
(181,"region","Power contesting coastal Andhra with Vijayanagar","Gajapati kingdom of Orissa","விஜயநகரத்துடன் ஆந்திரக் கடற்கரைப் பகுதியில் போட்டியிட்ட அரசு","ஒரிசாவின் கஜபதி அரசு"),
(181,"ruler","Greatest ruler of the Sangama dynasty according to the textbook","Devaraya II","பாடநூலின்படி சங்கம வம்சத்தின் சிறந்த அரசர்","தேவராயர் II"),
(181,"date","Reign of Devaraya II","1422–1446","தேவராயர் II ஆட்சிக்காலம்","1422–1446"),
(181,"military","Measure used by Devaraya II to strengthen cavalry","Recruitment of trained Muslim cavalry","தேவராயர் II குதிரைப்படையை வலுப்படுத்த எடுத்த நடவடிக்கை","பயிற்சி பெற்ற முஸ்லிம் குதிரைப்படையினரை சேர்த்தல்"),
(181,"military","Training given by Devaraya II to his soldiers","Archery training","தேவராயர் II தனது படைவீரர்களுக்கு வழங்கிய பயிற்சி","வில்ல்வித்தைப் பயிற்சி"),
(181,"traveller","Persian ambassador who described the vast extent of Devaraya II's realm","Abdur Razzak","தேவராயர் II அரசின் பரப்பை விவரித்த பாரசீகத் தூதர்","அப்துர் ரசாக்"),
(181,"region","King who paid tribute to Devaraya II","King of Sri Lanka","தேவராயர் IIக்கு கப்பம் செலுத்திய அரசர்","இலங்கை அரசர்"),
(181,"date","Period of repeated Gajapati attacks after Devaraya II","1460–1465","தேவராயர் IIக்குப் பின் கஜபதி படையெடுப்புகள் மீண்டும் நடந்த காலம்","1460–1465"),
(181,"place","River-city reached by a victorious Gajapati expedition","Tiruchirappalli on the Kaveri","கஜபதி வெற்றிப் படையெடுப்பு சென்றடைந்த காவேரிக்கரையிலான நகரம்","காவேரிக்கரையிலுள்ள திருச்சிராப்பள்ளி"),
(181,"person","Commander who seized the Vijayanagar throne around 1485","Saluva Narasimha","1485 சுமார் விஜயநகர அரியணையை கைப்பற்றிய தளபதி","சாளுவ நரசிம்மர்"),
(181,"date","Year around which Saluva Narasimha began the Saluva dynasty","1485","சாளுவ நரசிம்மர் சாளுவ வம்சத்தைத் தொடங்கிய சுமார் ஆண்டு","1485"),
(181,"person","General who assisted Saluva Narasimha and later became de facto ruler","Narasa Nayak","சாளுவ நரசிம்மருக்கு உதவி செய்து பின்னர் உண்மை ஆட்சியாளராக இருந்த தளபதி","நரச நாயக்"),
(181,"date","Year Saluva Narasimha died","1491","சாளுவ நரசிம்மர் இறந்த ஆண்டு","1491"),
(181,"person","Elder son of Narasa Nayak who began the Tuluva dynasty","Viranarasimha","துளுவ வம்சத்தைத் தொடங்கிய நரச நாயக்கின் மூத்த மகன்","வீர நரசிம்மர்"),
(181,"date","Approximate year Viranarasimha began the Tuluva dynasty","1505","வீர நரசிம்மர் துளுவ வம்சத்தைத் தொடங்கிய சுமார் ஆண்டு","1505"),
(181,"ruler","Successor and younger brother of Viranarasimha","Krishnadevaraya","வீர நரசிம்மரின் தம்பியும் வாரிசும்","கிருஷ்ணதேவராயர்"),
(181,"date","Reign of Krishnadevaraya","1509–1529","கிருஷ்ணதேவராயரின் ஆட்சிக்காலம்","1509–1529"),
(181,"chief","Rebellious chief subdued by Krishnadevaraya early in his reign","Ummattur chief","கிருஷ்ணதேவராயர் ஆட்சியின் தொடக்கத்தில் அடக்கிய கிளர்ச்சித் தலைவர்","உம்மத்தூர் தலைவர்"),
(181,"region","Traditional Deccan opponents of Krishnadevaraya","Bahmani Sultans","கிருஷ்ணதேவராயரின் பாரம்பரிய தக்காண எதிரிகள்","பாமினி சுல்தான்கள்"),
(181,"region","Eastern opponent of Krishnadevaraya","Gajapati of Orissa","கிருஷ்ணதேவராயரின் கிழக்குப் பகுதி எதிரி","ஒரிசா கஜபதி"),
(181,"place","Fort among those seized by Krishnadevaraya from Gajapati","Udayagiri","கஜபதியிடமிருந்து கிருஷ்ணதேவராயர் கைப்பற்றிய கோட்டைகளில் ஒன்று","உதயகிரி"),
(181,"place","Site where Krishnadevaraya planted a pillar of victory","Simhachalam","கிருஷ்ணதேவராயர் வெற்றித்தூண் நாட்டிய இடம்","சிம்மாசலம்"),

(182,"ally","European power that gave military aid to Krishnadevaraya in some campaigns","Portuguese","சில படையெடுப்புகளில் கிருஷ்ணதேவராயருக்கு இராணுவ உதவி அளித்த ஐரோப்பியர்","போர்த்துகீசியர்"),
(182,"place","Place where the Portuguese received permission to build a fort","Bhatkal","போர்த்துகீசியருக்கு கோட்டை கட்ட அனுமதி கிடைத்த இடம்","பட்கல்"),
(182,"temple","One major temple centre receiving large donations from Krishnadevaraya","Tirupati","கிருஷ்ணதேவராயரிடமிருந்து பெரிய நன்கொடைகள் பெற்ற முக்கிய கோவில் மையம்","திருப்பதி"),
(182,"temple","One major Siva centre receiving donations from Krishnadevaraya","Srisailam","கிருஷ்ணதேவராயரிடமிருந்து நன்கொடைகள் பெற்ற முக்கிய சிவத் தலம்","ஸ்ரீசைலம்"),
(182,"temple","Temple centre receiving donations from Krishnadevaraya","Kalahasti","கிருஷ்ணதேவராயரிடமிருந்து நன்கொடைகள் பெற்ற கோவில் மையம்","காளஹஸ்தி"),
(182,"temple","Tamil temple centre receiving donations from Krishnadevaraya","Kanchipuram","கிருஷ்ணதேவராயரிடமிருந்து நன்கொடைகள் பெற்ற தமிழ்நாட்டு கோவில் மையம்","காஞ்சிபுரம்"),
(182,"temple","Temple centre receiving donations from Krishnadevaraya","Tiruvannamalai","கிருஷ்ணதேவராயரிடமிருந்து நன்கொடைகள் பெற்ற கோவில் மையம்","திருவண்ணாமலை"),
(182,"temple","Temple centre receiving donations from Krishnadevaraya","Chidambaram","கிருஷ்ணதேவராயரிடமிருந்து நன்கொடைகள் பெற்ற கோவில் மையம்","சிதம்பரம்"),
(182,"traveller","Foreign visitor who praised Krishnadevaraya and Vijayanagar along with Nuniz","Paes","நூனிஸுடன் சேர்ந்து கிருஷ்ணதேவராயரையும் விஜயநகரத்தையும் புகழ்ந்த வெளிநாட்டு பயணி","பயஸ்"),
(182,"poet","Great Telugu poet at Krishnadevaraya's court","Allasani Peddana","கிருஷ்ணதேவராயர் அரசவையின் சிறந்த தெலுங்குக் கவிஞர்","அல்லசானி பெத்தண்ணா"),
(182,"poet","Telugu poet at Krishnadevaraya's court","Nandi Thimmana","கிருஷ்ணதேவராயர் அரசவையின் தெலுங்குக் கவிஞர்","நந்தி திம்மண்ணா"),
(182,"work","Famous Telugu poem authored by Krishnadevaraya","Amuktamalyada","கிருஷ்ணதேவராயர் எழுதிய புகழ்பெற்ற தெலுங்குக் கவிதை","ஆமுக்தமால்யதா"),
(182,"subject","Central story of Amuktamalyada","Story of Andal","ஆமுக்தமால்யதாவின் மையக் கதை","ஆண்டாள் கதை"),
(182,"achievement","Krishnadevaraya's crowning administrative achievement","Reorganisation and legal recognition of the Nayankara system","கிருஷ்ணதேவராயரின் முக்கிய நிர்வாகச் சாதனை","நாயக்கர் முறையை மறுசீரமைத்து சட்ட அங்கீகாரம் வழங்குதல்"),
(182,"ruler","Ruler who became king after Krishnadevaraya because his son was a child","Achyutadevaraya","கிருஷ்ணதேவராயரின் மகன் சிறுவனாக இருந்ததால் அடுத்து அரசரானவர்","அச்சுததேவராயர்"),
(182,"person","Son-in-law of Krishnadevaraya who sought to dominate succession politics","Ramaraya","கிருஷ்ணதேவராயரின் மருமகனாக இருந்து வாரிசுரிமை அரசியலை ஆட்கொள்ள முயன்றவர்","ராமராயர்"),
(182,"person","Powerful Nayak who initially supported Achyutadevaraya","Chellappa (Saluva Nayak)","ஆரம்பத்தில் அச்சுததேவராயரை ஆதரித்த வலுவான நாயக்கர்","செல்லப்பா (சாளுவ நாயக்)"),
(182,"date","Year of Achyutadevaraya's death","1542","அச்சுததேவராயர் இறந்த ஆண்டு","1542"),
(182,"ruler","Nephew who succeeded Achyutadevaraya","Sadasivaraya","அச்சுததேவராயருக்குப் பின் ஆட்சிக்கு வந்த அவரது மருமகன்","சதாசிவராயர்"),
(182,"date","Reign of Sadasivaraya","1542–1570","சதாசிவராயரின் ஆட்சிக்காலம்","1542–1570"),
(182,"person","Actual power-holder during Sadasivaraya's reign","Ramaraya","சதாசிவராயர் காலத்தில் உண்மையான அதிகாரம் வைத்தவர்","ராமராயர்"),
(182,"clan","Clan whose kinsmen Ramaraya appointed as Nayaks","Aravidu clan","ராமராயர் நாயக்கர்களாக நியமித்த உறவினர்கள் சேர்ந்த குலம்","ஆரவீடு குலம்"),
(182,"policy","Strategy used by Ramaraya toward the Deccan Sultanates","Divide and rule","தக்காண சுல்தானியங்களுக்கு எதிராக ராமராயர் பயன்படுத்திய உத்தி","பிரித்து ஆளும் உத்தி"),
(182,"treaty","European power with which Ramaraya made a commercial treaty","Portuguese","ராமராயர் வணிக ஒப்பந்தம் செய்த ஐரோப்பிய சக்தி","போர்த்துகீசியர்"),
(182,"commodity","Supply stopped to Bijapur through Ramaraya's Portuguese treaty","Horses","ராமராயரின் போர்த்துகீசிய ஒப்பந்தத்தால் பிஜாப்பூருக்கு நிறுத்தப்பட்ட விநியோகம்","குதிரைகள்"),
(182,"date","Month and year of the Battle of Talikota","January 1565","தாலிகோட்டா போர் நடந்த மாதமும் ஆண்டும்","ஜனவரி 1565"),
(182,"person","Vijayanagar commander captured and executed at Talikota","Ramaraya","தாலிகோட்டாவில் பிடிக்கப்பட்டு கொல்லப்பட்ட விஜயநகரத் தளபதி","ராமராயர்"),
(182,"result","Immediate fate of Vijayanagar city after Talikota","Ransacked for several months","தாலிகோட்டா போருக்குப் பின் விஜயநகர நகரத்தின் உடனடி நிலை","பல மாதங்கள் கொள்ளையிடப்பட்டது"),

(183,"place","Place to which Sadasivaraya and followers escaped after Talikota","Penugonda","தாலிகோட்டாவுக்குப் பின் சதாசிவராயரும் அவருடையவர்களும் தப்பிச் சென்ற இடம்","பெனுகொண்டா"),
(183,"person","Brother of Ramaraya who declared himself king in 1570","Tirumala","1570இல் தன்னை அரசராக அறிவித்த ராமராயரின் சகோதரர்","திருமலா"),
(183,"date","Year the Aravidu dynasty was begun by Tirumala","1570","திருமலா ஆரவீடு வம்சத்தைத் தொடங்கிய ஆண்டு","1570"),
(183,"date","Year of fighting near Uttaramerur mentioned in the textbook","1601","பாடநூலில் குறிப்பிடப்பட்ட உத்திரமேரூர் அருகிலான போரின் ஆண்டு","1601"),
(183,"person","Loyalist Nayak of Perumbedu in the 1601 Uttaramerur fighting","Yachama Nayak","1601 உத்திரமேரூர் போரில் பெரும்பேட்டின் விசுவாச நாயக்கர்","யாசம நாயக்"),
(183,"place","Nayak opposed to Yachama Nayak in 1601","Vellur (Vellore) Nayak","1601இல் யாசம நாயக்கருக்கு எதிரான நாயக்கர்","வேலூர் நாயக்கர்"),
(183,"office","Chief minister in Vijayanagar administration","Mahapradhani","விஜயநகர நிர்வாகத்தின் முதன்மை அமைச்சர்","மகாபிரதானி"),
(183,"office","Vijayanagar officer serving as commander","Dalavay","விஜயநகரத்தில் தளபதியாக இருந்த அதிகாரி","தளவாய்"),
(183,"office","Vijayanagar palace guard","Vassal","விஜயநகர அரண்மனை காவலர்","வாசல்"),
(183,"office","Vijayanagar secretary/accountant","Rayasam","விஜயநகரச் செயலாளர் அல்லது கணக்காளர்","ராயசம்"),
(183,"office","Vijayanagar personal attendant","Adaippam","விஜயநகர அரசரின் தனிப்பட்ட உதவியாளர்","அடைப்பம்"),
(183,"office","Vijayanagar executive agent","Kariya-karta","விஜயநகர நிர்வாக செயற்பாட்டு அதிகாரி","காரியகர்த்தா"),
(183,"term","Provincial administrative divisions created by Harihara I and successors","Rajyas","ஹரிஹரர் I மற்றும் அவரின் வாரிசுகள் உருவாக்கிய மாகாண நிர்வாகப் பிரிவுகள்","ராஜ்யங்கள்"),
(183,"office","Governor of a Vijayanagar rajya","Pradhani","விஜயநகர ராஜ்யத்தின் ஆளுநர்","பிரதானி"),
(183,"rajya","Prominent Vijayanagar province mentioned in the textbook","Hoysala rajya","பாடநூலில் குறிப்பிடப்பட்ட முக்கிய விஜயநகர மாகாணம்","ஹொய்சாள ராஜ்யம்"),
(183,"rajya","Prominent Vijayanagar province mentioned in the textbook","Araga","பாடநூலில் குறிப்பிடப்பட்ட முக்கிய விஜயநகர மாகாணம்","அராகா"),
(183,"rajya","Prominent Vijayanagar province associated with Mangalur","Barakur","மங்களூருடன் தொடர்புடைய விஜயநகர மாகாணம்","பாரகூர்"),
(183,"rajya","Prominent Vijayanagar province mentioned in the textbook","Muluvay","பாடநூலில் குறிப்பிடப்பட்ட முக்கிய விஜயநகர மாகாணம்","முளுவாய்"),
(183,"number","Number of rajyas in the Tamil area by 1400","Five","1400க்குள் தமிழ் பகுதியில் இருந்த ராஜ்யங்களின் எண்ணிக்கை","ஐந்து"),
(183,"rajya","One Tamil-area rajya listed for about 1400","Chandragiri","1400 சுமார் தமிழ் பகுதியில் இருந்த ஒரு ராஜ்யம்","சந்திரகிரி"),
(183,"rajya","One Tamil-area rajya listed for about 1400","Padaividu","1400 சுமார் தமிழ் பகுதியில் இருந்த ஒரு ராஜ்யம்","படைவீடு"),
(183,"rajya","One Tamil-area rajya listed for about 1400","Valudalampattu","1400 சுமார் தமிழ் பகுதியில் இருந்த ஒரு ராஜ்யம்","வழுதலம்பட்டு"),
(183,"rajya","One Tamil-area rajya listed for about 1400","Tiruchirappalli","1400 சுமார் தமிழ் பகுதியில் இருந்த ஒரு ராஜ்யம்","திருச்சிராப்பள்ளி"),
(183,"rajya","One Tamil-area rajya listed for about 1400","Tiruvarur","1400 சுமார் தமிழ் பகுதியில் இருந்த ஒரு ராஜ்யம்","திருவாரூர்"),
(183,"unit","Lowest unit of Vijayanagar administration","Village","விஜயநகர நிர்வாகத்தின் மிகச் சிறிய அலகு","கிராமம்"),
(183,"term","Military leader or soldier title used from the thirteenth century in Telugu and Kannada areas","Nayak","தெலுங்கு மற்றும் கன்னடப் பகுதிகளில் 13ஆம் நூற்றாண்டிலிருந்து இராணுவத் தலைவர் அல்லது வீரர் என்ற பொருளில் பயன்படுத்தப்பட்ட பட்டம்","நாயக்"),
(183,"kingdom","Earlier kingdom where assignment of locality revenue for military service is found","Kakatiya kingdom","இராணுவச் சேவைக்காக ஒரு பகுதியின் வருவாயை ஒதுக்கும் முறை முன்பே காணப்பட்ட அரசு","காகதீய அரசு"),
(183,"system","Delhi Sultanate institution compared with the Nayak revenue assignment","Iqta system","நாயக்கர் வருவாய் ஒதுக்கீட்டுடன் ஒப்பிடப்பட்ட டெல்லி சுல்தானிய முறை","இக்தா முறை"),
(183,"date","Approximate period when regular Nayak revenue assignments are clearly found in Vijayanagar","About 1500","விஜயநகரத்தில் நாயக்கர் வருவாய் ஒதுக்கீடு தெளிவாகக் காணப்படும் சுமார் காலம்","1500 சுமார்"),
(183,"term","Tamil term for Nayak revenue assignment","Nayakkattanam","நாயக்கர் வருவாய் ஒதுக்கீட்டின் தமிழ்ப் பெயர்","நாயக்கட்டணம்"),
(183,"term","Kannada term for Nayak revenue assignment","Nayaktanam","நாயக்கர் வருவாய் ஒதுக்கீட்டின் கன்னடப் பெயர்","நாயக்தனம்"),
(183,"term","Telugu term for Nayak revenue assignment","Nayankaramu","நாயக்கர் வருவாய் ஒதுக்கீட்டின் தெலுங்குப் பெயர்","நாயங்கரமு"),
(183,"rulers","Rulers under whom the Nayak practice became established","Krishnadevaraya and Achyutadevaraya","நாயக்கர் முறை நிலைபெற்ற அரசர்கள்","கிருஷ்ணதேவராயர் மற்றும் அச்சுததேவராயர்"),
(183,"traveller","Traveller who said Vijayanagar was divided among more than two hundred captains","Nuniz","விஜயநகரம் 200க்கும் மேற்பட்ட நாயக்கர்களிடையே பிரிக்கப்பட்டதாகக் கூறிய பயணி","நூனிஸ்"),
(183,"festival","Nine-day festival at which Nayaks made specified payments to the king","Mahanavami","நாயக்கர்கள் அரசருக்கு குறிப்பிட்ட வருவாயை செலுத்திய ஒன்பது நாள் திருவிழா","மகாநவமி"),

(184,"group","Language groups from which many Vijayanagar Nayaks came","Kannadiga and Telugu warriors","பல விஜயநகர நாயக்கர்கள் வந்த மொழிக் குழுக்கள்","கன்னட மற்றும் தெலுங்கு வீரர்கள்"),
(184,"group","Pastoral/forest clan mentioned among non-Brahmana Nayaks","Yadava","பிராமணர் அல்லாத நாயக்கர்களில் குறிப்பிடப்பட்ட மேய்ச்சல்/காட்டு குலம்","யாதவர்"),
(184,"group","Another pastoral/forest clan mentioned among non-Brahmana Nayaks","Billama","பிராமணர் அல்லாத நாயக்கர்களில் குறிப்பிடப்பட்ட மற்றொரு மேய்ச்சல்/காட்டு குலம்","பில்லமா"),
(184,"group","Peasant family background mentioned among Nayaks","Reddi","நாயக்கர்களில் குறிப்பிடப்பட்ட விவசாயக் குடும்பப் பின்னணி","ரெட்டி"),
(184,"group","Merchant background mentioned among Nayaks","Balija","நாயக்கர்களில் குறிப்பிடப்பட்ட வணிகர் பின்னணி","பலிஜா"),
(184,"person","Prominent Brahmana Nayak under Krishnadevaraya","Chellappa","கிருஷ்ணதேவராயர் கால முக்கிய பிராமண நாயக்கர்","செல்லப்பா"),
(184,"term","Commercial centres created by Nayaks in their territories","Pettai","நாயக்கர்கள் தங்கள் பகுதிகளில் உருவாக்கிய வணிக மையங்கள்","பேட்டை"),
(184,"result","Political change among Nayak chiefs after Talikota","Many became independent","தாலிகோட்டாவுக்குப் பின் நாயக்கர் தலைவர்களிடம் ஏற்பட்ட அரசியல் மாற்றம்","பலர் சுதந்திரமானார்கள்"),
(184,"state","Powerful Nayak state that emerged after Talikota","Madurai","தாலிகோட்டாவுக்குப் பின் உருவான வலுவான நாயக்க அரசு","மதுரை"),
(184,"state","Powerful Nayak state that emerged after Talikota","Tanjavur","தாலிகோட்டாவுக்குப் பின் உருவான வலுவான நாயக்க அரசு","தஞ்சாவூர்"),
(184,"state","Powerful Nayak state that emerged after Talikota","Ikkeri","தாலிகோட்டாவுக்குப் பின் உருவான வலுவான நாயக்க அரசு","இக்கேரி"),
(184,"person","Madurai Nayak who inaugurated the kingdom of Ramnad","Muthu Krishnappa","ராமநாதபுரம் அரசைத் தொடங்கிய மதுரை நாயக்கர்","முத்து கிருஷ்ணப்பர்"),
(184,"century","Period when the kingdom of Ramnad was inaugurated","Early seventeenth century","ராமநாதபுரம் அரசு தொடங்கப்பட்ட காலம்","பதினேழாம் நூற்றாண்டின் தொடக்கம்"),
(184,"term","Traditional protectors of village, temple and administrative bodies","Kavalkarars","கிராமம், கோவில் மற்றும் நிர்வாக அமைப்புகளைப் பாதுகாத்த பாரம்பரியப் பாதுகாவலர்கள்","காவல்காரர்கள்"),
(184,"title","Title of the kaval chief protecting Rameswaram temple","Udaiyan Sethupati","ராமேஸ்வரம் கோவிலை பாதுகாத்த காவல் தலைவரின் பட்டம்","உடையான் சேதுபதி"),
(184,"meaning","Meaning of Sethupati in the textbook context","Lord of the bridge or causeway","பாடநூல் சூழலில் சேதுபதி என்ற சொல்லின் பொருள்","பாலம் அல்லது அணைப்பாதையின் தலைவர்"),
(184,"principality","Small principality between Thanjavur and Madurai Nayak kingdoms","Pudukottai","தஞ்சாவூர் மற்றும் மதுரை நாயக்க அரசுகளுக்கிடையிலிருந்த சிற்றரசு","புதுக்கோட்டை"),
(184,"dynasty","Ruling house under which Pudukottai became a little kingdom","Tondaimans","புதுக்கோட்டை சிறிய அரசாக உருவான ஆட்சி வீடு","தொண்டைமான்கள்"),

(185,"date","Year of the producers' tax revolt in central Tamil Nadu","1430","மத்திய தமிழ்நாட்டில் உற்பத்தியாளர்களின் வரி எதிர்ப்பு நடந்த ஆண்டு","1430"),
(185,"cause","Main cause of the 1430 revolt","Unjust and arbitrary tax demands","1430 கிளர்ச்சியின் முக்கிய காரணம்","அநியாயமான மற்றும் மனப்போக்கான வரி கோரிக்கைகள்"),
(185,"result","Measure used by a Vijayanagar prince to pacify the 1430 revolt","Tax reduction","1430 கிளர்ச்சியை அமைதிப்படுத்த விஜயநகர இளவரசர் எடுத்த நடவடிக்கை","வரி குறைப்பு"),
(185,"craft","Craft specifically encouraged by Nayaks through tax concessions","Weaving","நாயக்கர்கள் வரிச்சலுகைகளால் ஊக்குவித்த குறிப்பிட்ட கைவினை","நெசவு"),
(185,"century","Century from which the Vijayanagar economy became more commercial","Fourteenth century","விஜயநகர பொருளாதாரம் அதிக வணிகமயமான நூற்றாண்டு","பதினான்காம் நூற்றாண்டு"),
(185,"economy","Economic development associated with increased use of coined money","Money economy","நாணயப் பயன்பாடு அதிகரித்ததுடன் தொடர்புடைய பொருளாதார வளர்ச்சி","பணப் பொருளாதாரம்"),
(185,"artisan","Artisan group becoming prominent in Vijayanagar society","Weavers","விஜயநகர சமூகத்தில் முக்கியமடைந்த கைவினைஞர் குழு","நெசவாளர்கள்"),
(185,"artisan","Artisan group becoming prominent in Vijayanagar society","Smiths","விஜயநகர சமூகத்தில் முக்கியமடைந்த கைவினைஞர் குழு","கொல்லர்கள்"),
(185,"artisan","Artisan group becoming prominent in Vijayanagar society","Masons","விஜயநகர சமூகத்தில் முக்கியமடைந்த கைவினைஞர் குழு","கட்டிடக் கலைஞர்கள்"),
(185,"term","General term for workshop people/non-agrarian groups","Pattadai","பணிமனை மக்கள் அல்லது வேளாண்மை அல்லாத குழுக்களின் பொதுப்பெயர்","பட்டடை"),
(185,"term","Term meaning the group that paid taxes in cash","Kasaya-vargam","பணமாக வரி செலுத்தும் குழுவைக் குறித்த சொல்","கசாய-வர்க்கம்"),
(185,"region","One area where many commercial and weaving centres arose","Northern Tamil Nadu","பல வணிக மற்றும் நெசவு மையங்கள் உருவான பகுதி","வட தமிழ்நாடு"),
(185,"region","Another area where commercial and weaving centres arose","Rayalaseema","வணிக மற்றும் நெசவு மையங்கள் உருவான மற்றொரு பகுதி","ராயலசீமா"),
(185,"region","Another area where commercial and weaving centres arose","Coastal Andhra","வணிக மற்றும் நெசவு மையங்கள் உருவான மற்றொரு பகுதி","ஆந்திரக் கடற்கரை"),
(185,"commodity","Major export from south Indian ports attracting Europeans","Textiles","ஐரோப்பியர்களை ஈர்த்த தென்னிந்திய துறைமுகங்களின் முக்கிய ஏற்றுமதி","துணிநூல்கள்"),
(185,"languages","Languages patronised by Vijayanagar rulers","Sanskrit, Tamil, Telugu and Kannada","விஜயநகர அரசர்கள் ஆதரித்த மொழிகள்","சமஸ்கிருதம், தமிழ், தெலுங்கு மற்றும் கன்னடம்"),
(185,"title","Literary title associated with Krishnadevaraya","Andhra Bhoja","கிருஷ்ணதேவராயரின் இலக்கியப் பட்டம்","ஆந்திர போஜா"),
(185,"scholar","Sanskrit scholar who wrote commentaries on the Vedas","Sayana","வேதங்களுக்கு உரை எழுதிய சமஸ்கிருத அறிஞர்","சயானா"),
(185,"office","Position of Sayana under Harihara II","Minister","ஹரிஹரர் II கீழ் சயானாவின் பதவி","அமைச்சர்"),
(185,"scholar","Sanskrit scholar closely connected with the Vijayanagar royal family","Madhavacharya","விஜயநகர அரச குடும்பத்துடன் நெருக்கமாக இருந்த சமஸ்கிருத அறிஞர்","மாதவாச்சாரியர்"),
(185,"poet","Woman poet who wrote Maduravijayam","Gangadevi","மதுரா விஜயத்தை எழுதிய பெண் கவிஞர்","கங்காதேவி"),
(185,"style","Literary style in which Maduravijayam describes the conquest of Madurai","Mahakavya style","மதுரா விஜயம் மதுரை வெற்றியை விவரிக்கும் இலக்கிய பாணி","மகாகாவிய பாணி"),
(185,"poet","Poet who served as a reporter in the court of Devaraya II","Hannamma","தேவராயர் II அரசவையில் செய்தியாளராக இருந்த கவிஞர்","ஹன்னம்மா"),
(185,"poet","Another famous woman poet of the Vijayanagar period","Thirumalamma","விஜயநகரக் காலத்தின் மற்றொரு புகழ்பெற்ற பெண் கவிஞர்","திருமலம்மா"),
(185,"scholar","Tamil scholar who wrote Chidambara Puranam and Chokkanatharula","Tirumalainatha","சிதம்பர புராணம் மற்றும் சொக்கநாதருலா எழுதிய தமிழ் அறிஞர்","திருமலைநாதர்"),
(185,"relation","Relation of Paranjyothiyar to Tirumalainatha","Son","பரஞ்சோதியாருக்கும் திருமலைநாதருக்கும் உள்ள உறவு","மகன்"),
(185,"translator","Scholar who translated Bhagavata Puranam into Tamil","Sevvaichchbuduvar","பாகவத புராணத்தை தமிழில் மொழிபெயர்த்தவர்","செவ்வைச்சூடுவர்"),
(185,"work","Vaishnavite work authored by Vadamalavi Annagalayyam","Irusamaya Filakkam","வடமலவி அண்ணகலையம் எழுதிய வைணவ நூல்","இருசமய விளக்கம்"),
(185,"scholar","Scholar proficient in both Sanskrit and Telugu","Nachana Somanatha","சமஸ்கிருதமும் தெலுங்கும் அறிந்த பெரிய அறிஞர்","நாசன சோமநாதர்"),
(185,"poet","Poet who composed a Telugu verse version of Kalidasa's Shakuntalam","Pillalamarri Pina Virabhadra Kavi","காளிதாசரின் சகுந்தலத்தை தெலுங்கு செய்யுளாக இயற்றிய கவிஞர்","பில்லலமற்ரி பின வீரபத்ர கவி"),
(185,"poet","Telugu poet in the court of Devaraya I","Srinatha","தேவராயர் I அரசவையின் தெலுங்குக் கவிஞர்","ஸ்ரீநாதர்"),
(185,"work","Work authored by Srinatha","Haravilasam","ஸ்ரீநாதர் எழுதிய நூல்","ஹரவிலாசம்"),
(185,"title","Another literary title of Krishnadevaraya","Abhinava Bhoja","கிருஷ்ணதேவராயரின் மற்றொரு இலக்கியப் பட்டம்","அபிநவ போஜா"),
(185,"term","Collective name for the eight great Telugu poets at Krishnadevaraya's court","Ashtadiggajas","கிருஷ்ணதேவராயர் அரசவையின் எட்டு சிறந்த தெலுங்குக் கவிஞர்களின் பொதுப்பெயர்","அஷ்டதிக்கஜர்கள்"),
(185,"title","Honorific of Allasani Peddanna","Andhrakavita-Pitamaha","அல்லசானி பெத்தண்ணாவின் பட்டம்","ஆந்திரகவிதா பிதாமஹா"),
(185,"work","Telugu work authored by Allasani Peddanna","Manucharita","அல்லசானி பெத்தண்ணா எழுதிய தெலுங்கு நூல்","மனுசரிதம்"),
(185,"scholar","Famous scholar and jester of Krishnadevaraya's court","Tenali Rama","கிருஷ்ணதேவராயர் அரசவையின் புகழ்பெற்ற அறிஞரும் நகைச்சுவையாளரும்","தெனாலிராமன்"),

(186,"work","Work authored by Tenali Rama","Panduranga Mahatyam","தெனாலிராமன் எழுதிய நூல்","பாண்டுரங்க மகாத்மியம்"),
(186,"work","Telugu work of Krishnadevaraya about Andal","Amuktamalyada","ஆண்டாளைப் பற்றிய கிருஷ்ணதேவராயரின் தெலுங்கு நூல்","ஆமுக்தமால்யதா"),
(186,"work","Sanskrit work authored by Krishnadevaraya","Usha Parinayam","கிருஷ்ணதேவராயர் எழுதிய சமஸ்கிருத நூல்","உஷா பரிணயம்"),
(186,"work","Another Sanskrit work authored by Krishnadevaraya","Jambavati Kalyanam","கிருஷ்ணதேவராயர் எழுதிய மற்றொரு சமஸ்கிருத நூல்","ஜாம்பவதி கல்யாணம்"),
(186,"title","Honorific used for Krishnadevaraya because of Telugu literary achievement","Andhra Pitamaha","தெலுங்கு இலக்கியச் சாதனையால் கிருஷ்ணதேவராயருக்கு வழங்கப்பட்ட பட்டம்","ஆந்திர பிதாமஹா"),
(186,"translator","Poet who translated Basava Purana into Kannada","Bhima Kavi","பசவ புராணத்தை கன்னடத்தில் மொழிபெயர்த்த கவிஞர்","பீம கவி"),
(186,"title","Title earned by Harihara II for Kannada learning","Karnataka Vidyavilasa","கன்னடக் கல்விக்காக ஹரிஹரர் II பெற்ற பட்டம்","கர்நாடக வித்யாவிலாசா"),
(186,"translator","Author of a Kannada version of the Ramayana","Kumara Velmiki","ராமாயணத்தின் கன்னடப் பதிப்பை இயற்றியவர்","குமார வால்மீகி"),
(186,"style","Temple architectural style associated with Vijayanagar rulers in the textbook","Dravida style","பாடநூலில் விஜயநகர அரசர்களுடன் தொடர்புடைய கோவில் கட்டிடக்கலை பாணி","திராவிட பாணி"),
(186,"feature","Tall gateways characteristic of Vijayanagar architecture","Raya Gopurams","விஜயநகர கட்டிடக்கலையின் உயரமான நுழைவுக் கோபுரங்கள்","ராய கோபுரங்கள்"),
(186,"feature","Ceremonial hall characteristic of Vijayanagar temples","Kalyanamandapam","விஜயநகரக் கோவில்களின் முக்கிய விழா மண்டபம்","கல்யாண மண்டபம்"),
(186,"animal","Most common animal depicted on Vijayanagar temple pillars","Horse","விஜயநகரக் கோவில் தூண்களில் அதிகம் செதுக்கப்பட்ட விலங்கு","குதிரை"),
(186,"number","Large mandapam sizes mentioned in the textbook","One hundred and one thousand pillars","பாடநூலில் குறிப்பிடப்பட்ட பெரிய மண்டபங்களின் தூண் எண்ணிக்கைகள்","நூறு மற்றும் ஆயிரம் தூண்கள்"),
(186,"place","One place with a fine example of Kalyana mandapa","Vellore","சிறந்த கல்யாண மண்டபம் காணப்படும் இடங்களில் ஒன்று","வேலூர்"),
(186,"temple","Kanchipuram temple cited for Kalyana mandapa","Varadharajaswami temple","கல்யாண மண்டபத்திற்காகக் குறிப்பிடப்பட்ட காஞ்சிபுரம் கோவில்","வரதராஜசுவாமி கோவில்"),
(186,"temple","Another Kanchipuram temple cited for Kalyana mandapa","Ekamparanatha temple","கல்யாண மண்டபத்திற்காகக் குறிப்பிடப்பட்ட மற்றொரு காஞ்சிபுரம் கோவில்","ஏகாம்பரநாதர் கோவில்"),
(186,"temple","Tiruchirappalli temple cited for Kalyana mandapa","Jambukesvara temple","கல்யாண மண்டபத்திற்காகக் குறிப்பிடப்பட்ட திருச்சிராப்பள்ளி கோவில்","ஜம்புகேஸ்வரர் கோவில்"),
(186,"feature","Smaller north-west shrine for the deity's consort","Amma Shrine","மூலவர் துணைவிக்கான வடமேற்குப் பகுதியில் உள்ள சிறிய சன்னதி","அம்மன் சன்னதி"),
(186,"origin","Period in which the Amma Shrine practice began","Late Chola period","அம்மன் சன்னதி மரபு தொடங்கிய காலம்","பிற்காலச் சோழர் காலம்"),
(186,"place","World Heritage City containing the finest Vijayanagar temples","Hampi","சிறந்த விஜயநகரக் கோவில்கள் உள்ள உலக பாரம்பரிய நகரம்","ஹம்பி"),
(186,"traveller","Foreign traveller whose account helps reconstruct Hampi architecture","Nicolo Conti","ஹம்பி கட்டிடக்கலையை அறிய உதவும் வெளிநாட்டு பயணி","நிக்கோலோ கொண்டி"),
(186,"feature","Important Vijayanagar temple feature made from a single stone","Monolithic pillars","ஒரே கல்லால் செய்யப்பட்ட விஜயநகர கோவில் கட்டிடக்கலை அம்சம்","ஒற்றைக்கல் தூண்கள்"),
(186,"place","Town founded by Krishnadevaraya in memory of his mother","Nagalapura","கிருஷ்ணதேவராயர் தனது தாயை நினைவுகூர்ந்து நிறுவிய நகரம்","நாகலாபுரம்"),
(186,"person","Mother of Krishnadevaraya commemorated by Nagalapura","Nagamba","நாகலாபுரம் மூலம் நினைவுகூரப்பட்ட கிருஷ்ணதேவராயரின் தாய்","நாகாம்பா"),
(186,"temple","Famous Vijayanagar temple associated with musical pillars","Vittalaswamy temple","இசைத்தூண்களுடன் தொடர்புடைய புகழ்பெற்ற விஜயநகரக் கோவில்","விட்டலசுவாமி கோவில்"),
(186,"temple","Another famous Vijayanagar temple at Hampi","Virupaksha temple","ஹம்பியில் உள்ள மற்றொரு புகழ்பெற்ற விஜயநகரக் கோவில்","விருபாக்ஷர் கோவில்"),
(186,"temple","Temple built during Krishnadevaraya's reign praised by Longhurst","Hazara temple","லாங்ஹர்ஸ்ட் புகழ்ந்த கிருஷ்ணதேவராயர் கால கோவில்","ஹசாரா கோவில்"),

(187,"feature","Musical feature of Vittalaswamy temple","Saptaswara musical pillars","விட்டலசுவாமி கோவிலின் இசைச் சிறப்பு","சப்தஸ்வர இசைத்தூண்கள்"),
(187,"monument","Famous stone monument at Vittalaswamy temple complex","Stone Chariot","விட்டலசுவாமி கோவில் வளாகத்தின் புகழ்பெற்ற கல் நினைவுச்சின்னம்","கல் தேர்"),
(187,"place","Temple associated with outstanding Vijayanagar paintings","Virabhadra temple","சிறந்த விஜயநகர ஓவியங்களுடன் தொடர்புடைய கோவில்","வீரபத்ரர் கோவில்"),
(187,"place","Site whose temple paintings show Vijayanagar excellence","Lepakshi","விஜயநகர ஓவியச் சிறப்பைக் காட்டும் கோவில் உள்ள இடம்","லேபாக்ஷி"),
(187,"epic","Epic stories inscribed on temple walls by Vijayanagar rulers","Ramayana","விஜயநகர அரசர்கள் கோவில் சுவர்களில் பதித்த காவியக் கதைகளில் ஒன்று","ராமாயணம்"),
(187,"epic","Another epic whose stories were inscribed on temple walls","Mahabharata","கோவில் சுவர்களில் பதிக்கப்பட்ட மற்றொரு காவியம்","மகாபாரதம்"),
(187,"art","Fine art patronised by Vijayanagar kings","Music","விஜயநகர அரசர்கள் ஆதரித்த நுண்கலை","இசை"),
(187,"art","Fine art patronised by Vijayanagar kings","Dance","விஜயநகர அரசர்கள் ஆதரித்த நுண்கலை","நடனம்"),
(187,"art","Fine art patronised by Vijayanagar kings","Drama","விஜயநகர அரசர்கள் ஆதரித்த நுண்கலை","நாடகம்"),
(187,"art","Fine art form specifically named in the textbook","Yakshagana","பாடநூலில் குறிப்பாகச் சொல்லப்பட்ட கலை வடிவம்","யக்ஷகானம்"),
(187,"portrait","Life-size portrait statue highlighted in Vijayanagar art","Narasimha","விஜயநகரக் கலையில் குறிப்பிடப்பட்ட இயல்பளவு உருவச்சிலை","நரசிம்மர்"),
(187,"portrait","Royal portrait group highlighted in Vijayanagar art","Krishnadevaraya and his two queens","விஜயநகரக் கலையில் குறிப்பிடப்பட்ட அரச உருவச்சிலைத் தொகுப்பு","கிருஷ்ணதேவராயரும் அவரது இரண்டு அரசிகளும்"),
(187,"painting","Wall painting in Virupaksha temple","Dasavathara","விருபாக்ஷர் கோவிலின் சுவரோவியம்","தசாவதாரம்"),
(187,"painting","Another wall painting in Virupaksha temple","Girijakalyanam","விருபாக்ஷர் கோவிலின் மற்றொரு சுவரோவியம்","கிரிஜா கல்யாணம்"),
]

def norm(s):
    return " ".join(str(s).split()).strip()

facts=[]
seen=set()
for row in F:
    p,k,de,ae,dt,at=row
    key=(norm(de).lower(),norm(ae).lower())
    if key in seen: 
        continue
    seen.add(key)
    facts.append({"page_en":p,"kind":k,"desc_en":norm(de),"ans_en":norm(ae),"desc_ta":norm(dt),"ans_ta":norm(at)})

pools=defaultdict(list)
for f in facts:
    pools[f["kind"]].append(f)
allfacts=facts[:]

def distractors(f, n=3):
    candidates=[x for x in pools[f["kind"]] if x["ans_en"].lower()!=f["ans_en"].lower()]
    # Prefer nearby pages for plausible options
    candidates.sort(key=lambda x:(abs(x["page_en"]-f["page_en"]), x["ans_en"]))
    chosen=[]
    seen_ans=set()
    for x in candidates:
        a=x["ans_en"].lower()
        if a not in seen_ans:
            chosen.append(x); seen_ans.add(a)
        if len(chosen)==n: break
    if len(chosen)<n:
        for x in allfacts:
            a=x["ans_en"].lower()
            if a!=f["ans_en"].lower() and a not in seen_ans:
                chosen.append(x); seen_ans.add(a)
            if len(chosen)==n: break
    return chosen

def shuffled_opts(correct_fact, ds, seed):
    items=[correct_fact]+ds
    rnd=random.Random(seed)
    rnd.shuffle(items)
    correct=items.index(correct_fact)
    return [x["ans_en"] for x in items],[x["ans_ta"] for x in items],correct

questions=[]
qid=1

def addq(page,qen,qta,oe,ot,correct,een,eta,typ):
    global qid
    questions.append({
        "id":f"C11H12-Q{qid:03d}",
        "quiz":(qid-1)//20+1,
        "page_en":page,
        "q_en":qen,
        "q_ta":qta,
        "opts_en":oe,
        "opts_ta":ot,
        "correct":correct,
        "exp_en":een,
        "exp_ta":eta,
        "type":typ
    })
    qid+=1

# Direct + association
for i,f in enumerate(facts):
    ds=distractors(f)
    oe,ot,c=shuffled_opts(f,ds,12000+i*11)
    exp_en=f'{f["desc_en"]}: {f["ans_en"]}.'
    exp_ta=f'{f["desc_ta"]}: {f["ans_ta"]}.'
    addq(f["page_en"],
         f'What is the correct textbook answer for: {f["desc_en"]}?',
         f'இதற்கான சரியான பாடநூல் விடை எது: {f["desc_ta"]}?',
         oe,ot,c,exp_en,exp_ta,"direct")
    oe2,ot2,c2=shuffled_opts(f,ds,22000+i*17)
    addq(f["page_en"],
         f'Which option is correctly associated with the following description: {f["desc_en"]}?',
         f'பின்வரும் விளக்கத்துடன் சரியாகப் பொருந்தும் விடை எது: {f["desc_ta"]}?',
         oe2,ot2,c2,exp_en,exp_ta,"association")

# Statement-analysis: one per fact, paired with next fact
comb_en=[
    "Both I and II are correct",
    "I is correct; II is incorrect",
    "I is incorrect; II is correct",
    "Both I and II are incorrect"
]
comb_ta=[
    "I மற்றும் II இரண்டும் சரி",
    "I சரி; II தவறு",
    "I தவறு; II சரி",
    "I மற்றும் II இரண்டும் தவறு"
]
for i,f in enumerate(facts):
    g=facts[(i+1)%len(facts)]
    mode=i%4
    # mode maps to correct option index above
    i_true=mode in (0,1)
    ii_true=mode in (0,2)
    wrong_f=distractors(f,1)[0]
    wrong_g=distractors(g,1)[0]
    a1=f["ans_en"] if i_true else wrong_f["ans_en"]
    t1=f["ans_ta"] if i_true else wrong_f["ans_ta"]
    a2=g["ans_en"] if ii_true else wrong_g["ans_en"]
    t2=g["ans_ta"] if ii_true else wrong_g["ans_ta"]
    qen=f'Consider the following statements:\nI. {f["desc_en"]} — {a1}.\nII. {g["desc_en"]} — {a2}.\nWhich option is correct?'
    qta=f'பின்வரும் கூற்றுகளைக் கவனிக்கவும்:\nI. {f["desc_ta"]} — {t1}.\nII. {g["desc_ta"]} — {t2}.\nசரியான விடை எது?'
    exp_en=[
        "Both Statement I and Statement II are correct.",
        "Statement I is correct and Statement II is incorrect.",
        "Statement I is incorrect and Statement II is correct.",
        "Both Statement I and Statement II are incorrect."
    ][mode]
    exp_ta=[
        "கூற்று I மற்றும் கூற்று II இரண்டும் சரி.",
        "கூற்று I சரி; கூற்று II தவறு.",
        "கூற்று I தவறு; கூற்று II சரி.",
        "கூற்று I மற்றும் கூற்று II இரண்டும் தவறு."
    ][mode]
    addq(max(f["page_en"],g["page_en"]),qen,qta,comb_en,comb_ta,mode,exp_en,exp_ta,"statement-analysis")

# Reorder so each fact's three variants stay near one another is not essential; quiz sets are mixed by type.
# Deterministic balancing of correct answer positions for direct/association is already randomized.
quiz_count=(len(questions)+19)//20
quiz_sets=[{
    "id":i,
    "title_en":f"Quiz {i} · Competitive Review",
    "title_ta":f"வினாடி வினா {i} · போட்டித் தேர்வு மீள்பார்வை"
} for i in range(1,quiz_count+1)]

answer_counts=Counter("ABCD"[q["correct"]] for q in questions)
out={
 "meta":{
    "board":"Tamil Nadu State Board",
    "class":11,
    "subject":"History",
    "edition":2025,
    "unit":12,
    "unit_en":"Bahmani and Vijayanagar Kingdoms",
    "unit_ta":"பாமினி மற்றும் விஜயநகர அரசுகள்",
    "source":"Government of Tamil Nadu Higher Secondary First Year History, Revised Edition 2025, English and Tamil editions supplied by the user",
    "total_questions":len(questions),
    "base_facts":len(facts),
    "quiz_sets":quiz_sets,
    "question_style":"Maximum useful source-grounded bilingual competitive-exam coverage from Unit 12: emergence and administration of the Bahmani Sultanate; Bahmani–Vijayanagar conflicts; Mohammed I and Mohammed Gawan; Golkonda; Vijayanagar foundation and four dynasties; Devaraya II and Krishnadevaraya; Talikota; administration and Nayak system; society, economy, literature, art and architecture.",
    "quality_policy":"Four-option bilingual MCQs grounded in the supplied 2025 English and Tamil textbooks. Classroom activities, assignments, ICT-only material and low-value procedural trivia are excluded. Distinct facts are reinforced through direct recall, association and statement-analysis formats.",
    "page_reference_note":"page_en refers to the printed English textbook page. Tamil printed page numbers differ and are not inferred.",
    "qa_all_four_options":all(len(q["opts_en"])==4 and len(q["opts_ta"])==4 for q in questions),
    "qa_valid_correct_indexes":all(0<=q["correct"]<4 for q in questions),
    "qa_exact_duplicate_question_options":0,
    "qa_duplicate_ids":len(questions)-len({q["id"] for q in questions}),
    "qa_answer_position_counts":dict(answer_counts)
 },
 "questions":questions
}

# Exact duplicate QA
sig=set(); dups=0
for q in questions:
    k=(q["q_en"],tuple(q["opts_en"]))
    if k in sig: dups+=1
    sig.add(k)
out["meta"]["qa_exact_duplicate_question_options"]=dups

os.makedirs(os.path.dirname(OUT),exist_ok=True)
with open(OUT,"w",encoding="utf-8") as fp:
    json.dump(out,fp,ensure_ascii=False,indent=2)
print(f"Wrote {OUT}: {len(facts)} facts, {len(questions)} questions, {quiz_count} quizzes")
