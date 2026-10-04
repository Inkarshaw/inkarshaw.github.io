import json, random, os
from collections import defaultdict, Counter

OUT="data/textbook/class-11/history/unit-13.json"
random.seed(1302026)

# page_en, kind, desc_en, ans_en, desc_ta, ans_ta
F=[
(190,"concept","Origin associated with mother-goddess worship in the chapter","Harappa","அத்தியாயத்தில் தாய்த்தெய்வ வழிபாட்டின் தோற்றத்துடன் தொடர்புடைய இடம்","ஹரப்பா"),
(190,"concept","Indus image identified in the textbook as","Siva","சிந்து நாகரிகச் சின்னத்தில் அடையாளம் காணப்பட்ட தெய்வம்","சிவன்"),
(190,"deity","One prime Vedic god named in the chapter","Indra","அத்தியாயத்தில் குறிப்பிடப்பட்ட முக்கிய வேதக் கடவுள்","இந்திரன்"),
(190,"deity","One prime Vedic god named in the chapter","Varuna","அத்தியாயத்தில் குறிப்பிடப்பட்ட முக்கிய வேதக் கடவுள்","வருணன்"),
(190,"deity","One prime Vedic god named in the chapter","Agni","அத்தியாயத்தில் குறிப்பிடப்பட்ட முக்கிய வேதக் கடவுள்","அக்னி"),
(190,"religion","Religion that arose with Jainism in the Indo-Gangetic valley in the mid-first millennium BCE","Buddhism","கி.மு. முதலாயிரமாண்டின் நடுப்பகுதியில் சமணத்துடன் இந்தோ-கங்கைப் பள்ளத்தாக்கில் தோன்றிய மதம்","பௌத்தம்"),
(190,"religion","Religion that arose with Buddhism in the Indo-Gangetic valley in the mid-first millennium BCE","Jainism","கி.மு. முதலாயிரமாண்டின் நடுப்பகுதியில் பௌத்தத்துடன் இந்தோ-கங்கைப் பள்ளத்தாக்கில் தோன்றிய மதம்","சமணம்"),
(190,"religion","Heterodox religion mentioned alongside Buddhism and Jainism","Ajivika","பௌத்தம், சமணத்துடன் குறிப்பிடப்பட்ட புறச்சமய மதம்","ஆசீவகம்"),
(190,"concept","Meaning of bhakti as a religious concept","Devotional surrender to a supreme god for salvation","மதக் கோட்பாடாக பக்தியின் பொருள்","முக்திக்காக பரம்பொருளிடம் பக்தியுடன் சரணடைதல்"),
(190,"work","Text mentioned as teaching the path of bhakti or bhakti-marga","Bhagavad Gita","பக்தி மார்க்கத்தை எடுத்துரைக்கும் நூல்","பகவத்கீதை"),
(190,"philosophy","Doctrine given by Adi Sankara to Hinduism","Advaita","ஆதி சங்கரர் இந்துமதத்திற்கு வழங்கிய தத்துவம்","அத்வைதம்"),
(190,"saints","Saiva poet-saints who gave popular form to Bhakti doctrine","Nayanmars","பக்திக் கோட்பாட்டிற்கு மக்களிடையே வடிவம் கொடுத்த சைவ அடியார்கள்","நாயன்மார்கள்"),
(190,"saints","Vaishnava poet-saints who gave popular form to Bhakti doctrine","Azhwars","பக்திக் கோட்பாட்டிற்கு மக்களிடையே வடிவம் கொடுத்த வைணவ அடியார்கள்","ஆழ்வார்கள்"),
(190,"period","Period when South India became a home of religious renaissance","7th to 10th centuries","தென்னிந்தியா மத மறுமலர்ச்சியின் இல்லமாக விளங்கிய காலம்","7ஆம் முதல் 10ஆம் நூற்றாண்டுகள்"),
(190,"person","Theologian who turned bhakti into a philosophical and ideological movement in the eleventh century","Ramanuja","11ஆம் நூற்றாண்டில் பக்தியை தத்துவ-சித்தாந்த இயக்கமாக மாற்றிய இறையியலாளர்","இராமானுஜர்"),
(191,"period","Century from which the bhakti cult became widespread throughout India","14th century","இந்தியா முழுவதும் பக்தி வழிபாடு பரவலான நூற்றாண்டு","14ஆம் நூற்றாண்டு"),
(191,"class","Social group that predominantly patronised Buddhism and Jainism in the south","Merchant class","தென்னிந்தியாவில் பௌத்தம், சமணத்தை பெரும்பாலும் ஆதரித்த சமூகக் குழு","வணிக வர்க்கம்"),
(191,"class","Social base among which the Bhakti movement originated according to the textbook","Landholding castes","பாடநூலின்படி பக்தி இயக்கம் தோன்றிய சமூக அடித்தளம்","நிலவுடைமைச் சாதிகள்"),
(191,"source","Main literary source category for religious conflicts in Tamil Nadu","Bhakti literature","தமிழக மத மோதல்களுக்கான முக்கிய இலக்கிய ஆதார வகை","பக்தி இலக்கியங்கள்"),
(191,"source","Biographical religious texts used as sources for Tamil religious conflicts","Hagiographical texts","தமிழக மத மோதல்களுக்கு ஆதாரமான திருத்தொண்டர் வாழ்க்கை நூல்கள்","திருத்தொண்டர் வரலாற்று நூல்கள்"),
(191,"work","Collection containing hymns of Appar, Sambandar and Sundarar","Thevaram","அப்பர், சம்பந்தர், சுந்தரர் பாடல்களைக் கொண்ட தொகுப்பு","தேவாரம்"),
(191,"saint","Another name of Appar","Thirunavukkarasar","அப்பரின் மற்றொரு பெயர்","திருநாவுக்கரசர்"),
(191,"saint","Another name of Sambandar","Thirugnanasambandar","சம்பந்தரின் மற்றொரு பெயர்","திருஞானசம்பந்தர்"),
(191,"number","Number of Saiva Thirumurais constituted by the hymns of Appar, Sambandar and Sundarar","Seven","அப்பர், சம்பந்தர், சுந்தரர் பாடல்கள் சேர்ந்த சைவ திருமுறைகளின் எண்ணிக்கை","ஏழு"),
(191,"work","Thirumurai number containing the hymns of Manickavasakar","Eighth Thirumurai","மாணிக்கவாசகர் பாடல்கள் இடம்பெறும் திருமுறை","எட்டாம் திருமுறை"),
(191,"work","Work by Sekkizhar narrating the stories of the sixty-three Nayanmars","Periyapuranam","அறுபத்துமூன்று நாயன்மார்களின் வரலாற்றைச் சொல்லும் சேக்கிழார் நூல்","பெரியபுராணம்"),
(191,"person","Author of Periyapuranam","Sekkizhar","பெரியபுராணத்தின் ஆசிரியர்","சேக்கிழார்"),
(191,"number","Number of Nayanmars narrated in Periyapuranam","Sixty-three","பெரியபுராணத்தில் கூறப்படும் நாயன்மார்களின் எண்ணிக்கை","அறுபத்துமூன்று"),
(191,"work","Compilation of the hymns of the Azhwars","Nalayira Divya Prabandham","ஆழ்வார்களின் பாடல்கள் தொகுக்கப்பட்ட நூல்","நாலாயிர திவ்வியப் பிரபந்தம்"),
(191,"source","Non-literary source type for the Bhakti movement mentioned with iconography","Epigraphical sources","சிற்பச் சின்னங்களுடன் குறிப்பிடப்பட்ட பக்தி இயக்கத்தின் இலக்கியமல்லாத ஆதாரம்","கல்வெட்டுச் சான்றுகள்"),
(191,"source","Visual source type for the Bhakti movement","Iconography","பக்தி இயக்கத்திற்கான காட்சிச் சான்று வகை","சிற்பச் சின்னவியல்"),
(191,"period","Period of the earliest conflicts between Saiva-Vaishnava traditions and Sramanic sects","Pallava period","சைவ-வைணவ மரபுகளும் சிரமண சமயங்களும் முதலில் மோதிய காலம்","பல்லவர் காலம்"),
(191,"ruler","Pallava ruler described as Jain by faith","Mahendravarman I","சமணத்தைப் பின்பற்றிய பல்லவ அரசர்","முதலாம் மகேந்திரவர்மன்"),
(191,"saint","Jaina name of Appar in his early life","Dharmasena","அப்பர் சமணராக இருந்தபோதைய பெயர்","தர்மசேனர்"),
(191,"influence","Person whose influence led Appar from Jainism to Saivism","His sister","அப்பர் சமணத்திலிருந்து சைவத்திற்கு மாற காரணமானவர்","அவரது தமக்கை"),
(191,"result","Final religious change of Mahendravarman I in the Appar episode","Conversion to Saivism","அப்பர் சம்பவத்தின் முடிவில் மகேந்திரவர்மன் I ஏற்ற மதம்","சைவம்"),
(191,"event","Saint said by tradition to have defeated the Jains in a theological debate","Sambandar","மரபின்படி இறையியல் விவாதத்தில் சமணர்களை வென்றவர்","சம்பந்தர்"),
(191,"ruler","Pandya ruler also known as Koon Pandyan","Maravarman Arikesari","கூன் பாண்டியன் என்றும் அழைக்கப்பட்ட பாண்டிய அரசர்","மாறவர்மன் அரிகேசரி"),
(191,"date","Reign period of Maravarman Arikesari given in the textbook","640–670","பாடநூலில் கொடுக்கப்பட்ட மாறவர்மன் அரிகேசரியின் ஆட்சிக்காலம்","640–670"),
(191,"saint","Saint under whose influence Koon Pandyan was reconverted to Saivism","Sambandar","கூன் பாண்டியனை மீண்டும் சைவத்திற்கு மாற்றியவர்","சம்பந்தர்"),
(191,"place","Village in Madurai district associated in a Saivite legend with persecution of Jains","Samantham","சமணர்கள் மீது வன்முறையுடன் தொடர்புடையதாக சைவ மரபில் குறிப்பிடப்படும் மதுரை மாவட்ட ஊர்","சமந்தம்"),
(191,"work","Saiva Siddhanta text containing the section called Parapakkam","Sivagnana Sithiyar","பரபக்கம் என்ற பகுதியைக் கொண்ட சைவ சித்தாந்த நூல்","சிவஞானசித்தியார்"),
(191,"term","Section of Sivagnana Sithiyar refuting Buddhist and Jain arguments","Parapakkam","பௌத்த-சமண வாதங்களை மறுக்கும் சிவஞானசித்தியார் பகுதி","பரபக்கம்"),
(191,"period","Century by which Buddhism and Jainism were effectively defeated in the Tamil country according to the textbook","11th century","தமிழ்நாட்டில் பௌத்தமும் சமணமும் பலவீனமானதாக பாடநூல் குறிப்பிடும் நூற்றாண்டு","11ஆம் நூற்றாண்டு"),
(192,"religion","Religion said to have disappeared from the Tamil country while Jain communities survived in pockets","Buddhism","தமிழ்நாட்டில் அழிந்துவிட்டதாகவும் சமணக் குழுக்கள் சில இடங்களில் தொடர்ந்ததாகவும் கூறப்படும் மதம்","பௌத்தம்"),
(192,"idea","Idea central to Buddhism and Jainism adopted by Saivites and Vaishnavites","Renunciation","பௌத்தம், சமணத்தின் மையக் கருத்தாக இருந்து சைவ-வைணவர்களால் ஏற்றுக்கொள்ளப்பட்ட கருத்து","துறவு"),
(192,"practice","Food habit whose high value is traced to Buddhist-Jain influence","Vegetarianism","பௌத்த-சமணத் தாக்கத்துடன் தொடர்புடைய உயர்வாக மதிக்கப்பட்ட உணவுப் பழக்கம்","சைவ உணவுமுறை"),
(192,"practice","Ethical prohibition traced to Buddhist-Jain influence","Prohibition on killing animals","பௌத்த-சமணத் தாக்கத்துடன் தொடர்புடைய நெறி","விலங்குகளைக் கொல்லாமை"),
(192,"language","Language accorded supremacy partly in response to Prakrit-using heterodox religions","Tamil","பிராகிருதங்களைப் பயன்படுத்திய புறச்சமயங்களுக்கு எதிரொலியாக உயர்வு பெற்ற மொழி","தமிழ்"),
(192,"philosophy","Philosophy expounded by Ramanuja","Vishishtadvaita","இராமானுஜர் விளக்கிய தத்துவம்","விசிஷ்டாத்வைதம்"),
(192,"meaning","Meaning given for Vishishtadvaita","Qualified monism","விசிஷ்டாத்வைதத்தின் பொருள்","தகுதிப்படுத்தப்பட்ட ஒருமைவாதம்"),
(192,"philosophy","Philosophy of Adi Sankara contrasted with Vishishtadvaita","Absolute monism","விசிஷ்டாத்வைதத்துடன் ஒப்பிடப்பட்ட ஆதி சங்கரரின் கோட்பாடு","முழுமையான ஒருமைவாதம்"),
(192,"period","Century from which devotional poetry had an extraordinary outburst in North India","15th century","வடஇந்தியாவில் பக்திப் பாடல்கள் பெருமளவில் எழுந்த நூற்றாண்டு","15ஆம் நூற்றாண்டு"),
(192,"movement","Movement that arose alongside Vaishnava Bhakti in North India","Popular monotheistic movement","வடஇந்தியாவில் வைணவ பக்தியுடன் எழுந்த இயக்கம்","மக்கள் ஒரேகடவுள் இயக்கம்"),
(192,"feature","Dominant religions from which northern monotheists claimed independence","Hinduism and Islam","வடஇந்திய ஒரேகடவுள் இயக்கத்தினர் தங்களைத் தனித்ததாகக் கருதிய இரு முக்கிய மதங்கள்","இந்துமதம் மற்றும் இஸ்லாம்"),
(192,"period","By when Islam had spread to large parts of India according to the chapter","End of the 14th century","இந்தியாவின் பெரும்பகுதிகளில் இஸ்லாம் பரவிய காலம்","14ஆம் நூற்றாண்டின் இறுதி"),
(192,"idea","Islamic principle said to attract lower sections of society","Equality","சமூகத்தின் கீழ்தட்டு மக்களை ஈர்த்த இஸ்லாமியக் கோட்பாடு","சமத்துவம்"),
(192,"trend","One tendency of new non-conformist movements","Anti-caste","புதிய ஒழுங்குமீறிய இயக்கங்களின் ஒரு போக்கு","சாதி எதிர்ப்பு"),
(192,"trend","One tendency of new non-conformist movements","Anti-Vedic","புதிய ஒழுங்குமீறிய இயக்கங்களின் ஒரு போக்கு","வேத எதிர்ப்பு"),
(192,"trend","One tendency of new non-conformist movements","Anti-Puranic","புதிய ஒழுங்குமீறிய இயக்கங்களின் ஒரு போக்கு","புராண எதிர்ப்பு"),
(192,"development","Cultural development arising from the new political-social situation","Growth of regional languages","புதிய அரசியல்-சமூக சூழலின் பண்பாட்டு விளைவு","பிராந்திய மொழிகளின் வளர்ச்சி"),
(192,"development","Language that evolved in the new cultural situation","Hindustani","புதிய பண்பாட்டு சூழலில் உருவான மொழி","இந்துஸ்தானி"),
(192,"development","Musical tradition that evolved from cultural interaction","Indo-Muslim music","பண்பாட்டு பரிமாற்றத்தால் உருவான இசை மரபு","இந்தோ-முஸ்லிம் இசை"),
(192,"development","Architectural tradition that evolved from cultural interaction","Indo-Muslim architecture","பண்பாட்டு பரிமாற்றத்தால் உருவான கட்டிடக்கலை மரபு","இந்தோ-முஸ்லிம் கட்டிடக்கலை"),
(192,"saint","Syncretic saint named with Guru Nanak and Ravidas","Kabir","குருநானக், ரவிதாஸ் ஆகியோருடன் குறிப்பிடப்பட்ட ஒருமைப்பாட்டு துறவி","கபீர்"),
(192,"saint","Syncretic saint named with Kabir and Ravidas","Guru Nanak","கபீர், ரவிதாஸ் ஆகியோருடன் குறிப்பிடப்பட்ட ஒருமைப்பாட்டு துறவி","குருநானக்"),
(192,"saint","Syncretic saint named with Kabir and Guru Nanak","Ravidas","கபீர், குருநானக் ஆகியோருடன் குறிப்பிடப்பட்ட ஒருமைப்பாட்டு துறவி","ரவிதாஸ்"),
(192,"tradition","Islamic mystical tradition said to play a role parallel to Bhakti","Sufism","பக்தி இயக்கத்துக்கு இணையாக இஸ்லாமில் செயல்பட்ட ஆன்மிக மரபு","சூபியிசம்"),
(192,"term","One term used for Muslim saints","Sufi","முஸ்லிம் ஞானிகளை குறிக்கும் ஒரு சொல்","சூஃபி"),
(192,"term","One term used for Muslim saints","Wali","முஸ்லிம் ஞானிகளை குறிக்கும் ஒரு சொல்","வலி"),
(192,"term","One term used for Muslim saints","Darvesh","முஸ்லிம் ஞானிகளை குறிக்கும் ஒரு சொல்","தர்வேஷ்"),
(192,"term","One term used for Muslim saints","Fakir","முஸ்லிம் ஞானிகளை குறிக்கும் ஒரு சொல்","பக்கீர்"),
(192,"practice","Method used by Sufis to develop intuitive faculties","Ascetic exercises","உள்ளுணர்வை வளர்க்க சூஃபிகள் பயன்படுத்திய முறை","துறவுப் பயிற்சிகள்"),
(192,"practice","Method used by Sufis to develop intuitive faculties","Contemplation","உள்ளுணர்வை வளர்க்க சூஃபிகள் பயன்படுத்திய முறை","தியானம்"),
(192,"practice","Method used by Sufis to develop intuitive faculties","Renunciation","உள்ளுணர்வை வளர்க்க சூஃபிகள் பயன்படுத்திய முறை","துறவு"),
(192,"practice","Method used by Sufis to develop intuitive faculties","Self-denial","உள்ளுணர்வை வளர்க்க சூஃபிகள் பயன்படுத்திய முறை","சுயத் துறப்பு"),
(192,"period","Century by which Sufism had become an influential aspect of Islamic social life","12th century","சூபியிசம் இஸ்லாமிய சமூக வாழ்வில் முக்கிய தாக்கமாகிய நூற்றாண்டு","12ஆம் நூற்றாண்டு"),
(193,"concept","Dimension of Islam represented by Sufism","Mystical dimension","சூபியிசம் பிரதிநிதித்துவப்படுத்தும் இஸ்லாமின் பரிமாணம்","மெய்ஞ்ஞான பரிமாணம்"),
(193,"concept","How Sufis regarded God","Supreme beauty","சூஃபிகள் கடவுளை எவ்வாறு கருதினர்","உயர்ந்த அழகு"),
(193,"term","Sufi term for God as the beloved","Mashuq","அன்புக்குரிய கடவுளை குறிக்கும் சூஃபி சொல்","மஷூக்"),
(193,"term","Sufi term for the lovers of God","Ashiqs","கடவுளின் காதலர்களாக சூஃபிகளை குறிக்கும் சொல்","ஆஷிக்குகள்"),
(193,"term","Name for Sufi orders","Silsilahs","சூஃபி மரபுக் குழுக்களின் பெயர்","சில்சிலாக்கள்"),
(193,"order","Popular Sufi order mentioned in the chapter","Chistis","அத்தியாயத்தில் குறிப்பிடப்பட்ட பிரபல சூஃபி மரபு","சிஷ்திகள்"),
(193,"order","Popular Sufi order mentioned in the chapter","Suhrawardis","அத்தியாயத்தில் குறிப்பிடப்பட்ட பிரபல சூஃபி மரபு","சுஹ்ரவர்திகள்"),
(193,"order","Popular Sufi order mentioned in the chapter","Qadiriyahs","அத்தியாயத்தில் குறிப்பிடப்பட்ட பிரபல சூஃபி மரபு","காதிரிய்யாக்கள்"),
(193,"order","Popular Sufi order mentioned in the chapter","Naqshbandis","அத்தியாயத்தில் குறிப்பிடப்பட்ட பிரபல சூஃபி மரபு","நக்ஷ்பந்திகள்"),
(193,"feature","Areas in which Sufism took root","Rural and urban areas","சூபியிசம் வேரூன்றிய பகுதிகள்","கிராமப்புறமும் நகர்ப்புறமும்"),
(193,"goal","Ultimate goal in the Sufi world order described in the chapter","Spiritual bliss","சூஃபிகள் நோக்கிய இறுதி இலக்கு","ஆன்மிக பேரானந்தம்"),
(193,"impact","Major social contribution of Sufism to Hindu-Muslim relations","Reduced conflicts and prejudices","இந்துக்-முஸ்லிம் உறவில் சூபியிசத்தின் முக்கிய பங்களிப்பு","மோதல்களையும் முன்வெறுப்புகளையும் தணித்தல்"),
(193,"principle","First salient principle preached by Bhakti reformers","Monotheism","பக்தி சீர்திருத்தவாதிகளின் முதல் முக்கியக் கொள்கை","ஒரேகடவுள் கொள்கை"),
(193,"goal","Bhakti means to attain salvation","Deep devotion and faith in God","பக்தி வழியில் முக்தி பெறும் வழி","இறைவன் மீது ஆழ்ந்த பக்தியும் நம்பிக்கையும்"),
(193,"principle","Bhakti means emphasized for obtaining God's grace","Self-surrender","இறையருள் பெற பக்தி வலியுறுத்திய முறை","சரணாகதி"),
(193,"role","Role assigned to gurus in the Bhakti movement","Guides and preceptors","பக்தி இயக்கத்தில் குருமார்களின் பங்கு","வழிகாட்டிகளும் ஆசான்களும்"),
(193,"principle","Social ideal advocated by Bhakti reformers","Universal brotherhood","பக்தி சீர்திருத்தவாதிகள் வலியுறுத்திய சமூக இலக்கு","உலக சகோதரத்துவம்"),
(193,"critique","Practice criticized by Bhakti reformers","Idol worship","பக்தி சீர்திருத்தவாதிகள் விமர்சித்த நடைமுறை","சிலை வழிபாடு"),
(193,"practice","Devotional practice stressed by Bhakti reformers","Singing hymns with deep devotion","பக்தி சீர்திருத்தவாதிகள் வலியுறுத்திய பக்திப் பயிற்சி","ஆழ்ந்த பக்தியுடன் பாடல்கள் பாடுதல்"),
(193,"critique","Social system strongly denounced by Bhakti reformers","Caste system","பக்தி சீர்திருத்தவாதிகள் கடுமையாக கண்டித்த சமூக அமைப்பு","சாதி முறை"),
(193,"critique","Practice condemned by Bhakti reformers","Ritualism","பக்தி சீர்திருத்தவாதிகள் கண்டித்த நடைமுறை","சடங்குவாதம்"),
(193,"critique","Practice condemned by Bhakti reformers","Pilgrimages","பக்தி சீர்திருத்தவாதிகள் கண்டித்த நடைமுறை","யாத்திரைகள்"),
(193,"critique","Practice condemned by Bhakti reformers","Fasts","பக்தி சீர்திருத்தவாதிகள் கண்டித்த நடைமுறை","நோன்புகள்"),
(193,"language","Language policy of Bhakti poets","Use of common people's languages","பக்திக் கவிஞர்களின் மொழிப் போக்கு","மக்களின் வழக்குமொழிகளைப் பயன்படுத்துதல்"),
(193,"saint","Medieval cultural figure whose iconoclastic poetry attacked ostentation and ritual","Kabir","ஆடம்பரத்தையும் சடங்கையும் விமர்சித்த நடுக்காலப் பண்பாட்டு ஆளுமை","கபீர்"),
(193,"occupation","Probable occupation of Kabir","Weaver","கபீரின் சாத்தியமான தொழில்","நெசவாளர்"),
(193,"teacher","Bhakti teacher from whom Kabir is said to have learnt Vedanta","Ramananda","கபீர் வேதாந்தம் கற்றதாகக் கூறப்படும் பக்தி ஆசான்","இராமானந்தர்"),
(193,"source","Work saying Kabir was a disciple of Shaikh Taqi","Tazkirah-i-Auliya-i-Hind","கபீர் ஷேக் தகியின் சீடர் எனக் கூறும் நூல்","தஸ்கிரா-இ-அவ்லியா-இ-ஹிந்த்"),
(193,"teacher","Sufi teacher named as Kabir's master in Tazkirah-i-Auliya-i-Hind","Shaikh Taqi","தஸ்கிரா-இ-அவ்லியா-இ-ஹிந்த் நூலில் கபீரின் சூஃபி ஆசானாகக் குறிப்பிடப்பட்டவர்","ஷேக் தகி"),
(193,"critique","Religious feature denounced by Kabir","Polytheism","கபீர் கண்டித்த சமய அம்சம்","பலதெய்வ வழிபாடு"),
(193,"critique","Religious feature denounced by Kabir","Idolatry","கபீர் கண்டித்த சமய அம்சம்","சிலை வழிபாடு"),
(193,"critique","Social feature denounced by Kabir","Caste","கபீர் கண்டித்த சமூக அம்சம்","சாதி"),
(193,"critique","Islamic practice criticized by Kabir","Muslim formalism","கபீர் விமர்சித்த இஸ்லாமிய நடைமுறை","முஸ்லிம் சடங்கு முறைத்தனம்"),

(194,"period","Life span of Chaitanya","1485–1533","சைதன்யரின் வாழ்நாள்","1485–1533"),
(194,"region","Region associated with Chaitanya","Bengal","சைதன்யருடன் தொடர்புடைய பகுதி","வங்காளம்"),
(194,"deity","Deity whose supremacy Chaitanya exalted","Krishna","சைதன்யர் உயர்ந்ததாக வலியுறுத்திய தெய்வம்","கிருஷ்ணர்"),
(194,"character","Character of Chaitanya's movement according to the textbook","Revivalist, not syncretic","பாடநூலின்படி சைதன்யரின் இயக்கத்தின் தன்மை","மறுமலர்ச்சி சார்ந்தது; ஒருமைப்பாட்டு இயக்கமல்ல"),
(194,"practice","Practice popularised by Chaitanya","Group devotional singing with ecstatic dancing","சைதன்யர் பிரபலப்படுத்திய பக்திப் பயிற்சி","குழுப் பக்திப் பாடலுடன் பேரானந்த நடனம்"),
(194,"regions","Regions where Chaitanya's movement became popular","Bengal and Orissa","சைதன்யரின் இயக்கம் பிரபலமான பகுதிகள்","வங்காளம் மற்றும் ஒரிசா"),
(194,"saint","Bhakti saint who was the son of a tailor","Namadeva","தையல்காரரின் மகனாகப் பிறந்த பக்திச் சான்றோர்","நாமதேவர்"),
(194,"place","Village associated with Namadeva","Naras-Vamani","நாமதேவருடன் தொடர்புடைய கிராமம்","நரஸ்-வாமணி"),
(194,"district","District in Maharashtra associated with Namadeva","Satara","நாமதேவருடன் தொடர்புடைய மகாராஷ்டிர மாவட்டம்","சதாரா"),
(194,"influence","Saint under whose influence Namadeva entered the path of bhakti","Janadeva","நாமதேவர் பக்திப் பாதையை ஏற்கத் தாக்கம் செய்தவர்","ஜனதேவர்"),
(194,"deity","Deity worshipped by Namadeva","Vithala","நாமதேவர் வழிபட்ட தெய்வம்","வித்தலர்"),
(194,"place","Pilgrimage centre associated with Namadeva's Vithala devotion","Pandarpur","நாமதேவரின் வித்தலர் பக்தியுடன் தொடர்புடைய தலம்","பண்டர்பூர்"),
(194,"form","Devotional song form written by Namadeva","Abhangs","நாமதேவர் எழுதிய பக்திப் பாடல் வடிவம்","அபங்கங்கள்"),
(194,"languages","Languages in which Namadeva wrote abhangs","Marathi and Hindi","நாமதேவர் அபங்கங்கள் எழுதிய மொழிகள்","மராத்தி மற்றும் இந்தி"),
(194,"region","Region as far as which Namadeva travelled","Punjab","நாமதேவர் பயணம் செய்த தொலைந்த பகுதி","பஞ்சாப்"),
(194,"scripture","Sikh scripture that later absorbed Namadeva's teachings","Guru Granth Sahib","நாமதேவரின் போதனைகள் பின்னர் இணைக்கப்பட்ட சீக்கிய நூல்","குரு கிரந்த் சாஹிப்"),
(194,"period","Period of Ravidas as a Bhakti poet-saint","15th to 16th centuries","ரவிதாஸ் பக்திக் கவிஞராக வாழ்ந்த காலம்","15ஆம் முதல் 16ஆம் நூற்றாண்டுகள்"),
(194,"region","One region where Ravidas was venerated as a guru","Punjab","ரவிதாஸ் குருவாகப் போற்றப்பட்ட பகுதி","பஞ்சாப்"),
(194,"region","One region where Ravidas was venerated as a guru","Rajasthan","ரவிதாஸ் குருவாகப் போற்றப்பட்ட பகுதி","ராஜஸ்தான்"),
(194,"region","One region where Ravidas was venerated as a guru","Maharashtra","ரவிதாஸ் குருவாகப் போற்றப்பட்ட பகுதி","மகாராஷ்டிரம்"),
(194,"region","One region where Ravidas was venerated as a guru","Madhya Pradesh","ரவிதாஸ் குருவாகப் போற்றப்பட்ட பகுதி","மத்தியப் பிரதேசம்"),
(194,"family","Traditional occupation of Ravidas's family","Tanners","ரவிதாஸ் பிறந்ததாகக் கருதப்படும் குடும்பத் தொழில்","தோல் பதனிடுபவர்கள்"),
(194,"teacher","Bhakti saint-poet whose disciple Ravidas was","Ramananda","ரவிதாஸ் சீடராக இருந்த பக்திச் சான்றோர்","இராமானந்தர்"),
(194,"scripture","Religious scripture including devotional songs of Ravidas","Sikh Scriptures","ரவிதாஸின் பக்திப்பாடல்கள் இடம்பெற்ற சமய நூல்","சீக்கிய மறைநூல்கள்"),
(194,"reform","Social division opposed by Ravidas","Caste","ரவிதாஸ் எதிர்த்த சமூகப் பிரிவு","சாதி"),
(194,"reform","Social division opposed by Ravidas","Gender discrimination","ரவிதாஸ் எதிர்த்த சமூகப் பிரிவு","பாலின வேறுபாடு"),
(194,"period","Life span of Guru Nanak","1469–1539","குருநானக்கின் வாழ்நாள்","1469–1539"),
(194,"religion","Religion founded by Guru Nanak","Sikhism","குருநானக் நிறுவிய மதம்","சீக்கியம்"),
(194,"principle","Central theological principle of Sikhism highlighted in the chapter","Oneness of God","அத்தியாயத்தில் வலியுறுத்தப்பட்ட சீக்கியத்தின் மைய இறையியல் கொள்கை","கடவுள் ஒருவன்"),
(194,"principle","Ethical feature emphasized by Sikhism","Strict morality","சீக்கியம் வலியுறுத்திய ஒழுக்க அம்சம்","கடுமையான ஒழுக்கம்"),
(194,"number","Number of Sikh gurus under whom Sikhism expanded","Ten","சீக்கியம் விரிவடைந்த குருமார்களின் எண்ணிக்கை","பத்து"),
(194,"region","Main region of Sikh expansion","Punjab","சீக்கியம் வேகமாகப் பரவிய முக்கிய பகுதி","பஞ்சாப்"),
(194,"guru","Last Sikh Guru","Guru Gobind Singh","கடைசி சீக்கிய குரு","குரு கோவிந்த் சிங்"),
(194,"scripture","Text regarded as the Guru after Guru Gobind Singh","Granth Sahib","குரு கோவிந்த் சிங்கிற்குப் பின் குருவாகக் கருதப்பட்ட நூல்","கிரந்த் சாஹிப்"),
(194,"poet","Bhakti poet whose writings were incorporated in Guru Granth Sahib","Ramananda","குரு கிரந்த் சாஹிபில் பாடல்கள் இடம்பெற்ற பக்திக் கவிஞர்","இராமானந்தர்"),
(194,"poet","Bhakti poet whose writings were incorporated in Guru Granth Sahib","Namadeva","குரு கிரந்த் சாஹிபில் பாடல்கள் இடம்பெற்ற பக்திக் கவிஞர்","நாமதேவர்"),
(194,"poet","Bhakti poet whose writings were incorporated in Guru Granth Sahib","Kabir","குரு கிரந்த் சாஹிபில் பாடல்கள் இடம்பெற்ற பக்திக் கவிஞர்","கபீர்"),
(194,"saint","Sufi saint whose writings were incorporated in Guru Granth Sahib","Sheikh Farid","குரு கிரந்த் சாஹிபில் பாடல்கள் இடம்பெற்ற சூஃபி சான்றோர்","ஷேக் ஃபரீத்"),

(195,"period","Life span of Ramananda","1400–1470","இராமானந்தரின் வாழ்நாள்","1400–1470"),
(195,"school","Philosophical school associated with Chaitanya through Madhavacharya","Dvaita","மாதவாச்சாரியர் வழியாக சைதன்யருடன் தொடர்புடைய தத்துவப் பள்ளி","துவைதம்"),
(195,"school","Philosophical tradition followed by Ramananda","Ramanuja's school","இராமானந்தர் பின்பற்றிய தத்துவ மரபு","இராமானுஜர் பள்ளி"),
(195,"place","Birthplace of Ramananda","Prayag (Allahabad)","இராமானந்தர் பிறந்த இடம்","பிரயாக் (அலகாபாத்)"),
(195,"place","Place where Ramananda received higher education in Hindu philosophy","Banaras","இராமானந்தர் உயர்கல்வி பெற்ற இடம்","பனாரஸ்"),
(195,"religion","Tradition preached by Ramananda across North India","Vaishnavism","இராமானந்தர் வடஇந்தியாவில் போதித்த மரபு","வைணவம்"),
(195,"deities","Deities central to Ramananda's own sect","Rama and Sita","இராமானந்தரின் தனிப் பிரிவின் மையத் தெய்வங்கள்","ராமர் மற்றும் சீதை"),
(195,"principle","Social doctrine preached by Ramananda","Equality before God","இராமானந்தர் போதித்த சமூகக் கொள்கை","கடவுளின் முன் சமத்துவம்"),
(195,"critique","Institution rejected by Ramananda","Caste system","இராமானந்தர் நிராகரித்த சமூக அமைப்பு","சாதி முறை"),
(195,"critique","Claim rejected by Ramananda","Brahmin supremacy as sole custodians of Hindu religion","இராமானந்தர் நிராகரித்த உரிமைக் கோரிக்கை","இந்து மதத்தின் ஒரே காவலர்களாக பிராமணர் உயர்வு"),
(195,"number","Number of Ramananda's disciples mentioned in the textbook","Twelve","பாடநூலில் குறிப்பிடப்பட்ட இராமானந்தரின் சீடர்கள் எண்ணிக்கை","பன்னிரண்டு"),
(195,"disciple","Disciple of Ramananda highlighted in the chapter","Ravidas","அத்தியாயத்தில் குறிப்பிடப்பட்ட இராமானந்தரின் சீடர்","ரவிதாஸ்"),
(195,"disciple","Disciple of Ramananda highlighted in the chapter","Kabir","அத்தியாயத்தில் குறிப்பிடப்பட்ட இராமானந்தரின் சீடர்","கபீர்"),
(195,"number","Number of women included among Ramananda's twelve disciples","Two","இராமானந்தரின் பன்னிரண்டு சீடர்களில் பெண்களின் எண்ணிக்கை","இரண்டு"),
(195,"language","Language in which Ramananda was first to preach his doctrine of devotion","Hindi","இராமானந்தர் முதன்முதலில் பக்திக் கொள்கையைப் போதித்த மொழி","இந்தி"),
(195,"schools","Two groups into which Ramananda's followers divided","Conservative and radical schools","இராமானந்தரின் பின்தொடர்பவர்கள் பிரிந்த இரு அணிகள்","பழமைவாத மற்றும் தீவிர சீர்திருத்த அணிகள்"),
(195,"period","Life span of Mirabai","1498–1546","மீராபாயின் வாழ்நாள்","1498–1546"),
(195,"place","Birthplace of Mirabai given in the chapter","Kudh of Merta district, Rajasthan","அத்தியாயத்தில் கொடுக்கப்பட்ட மீராபாய் பிறந்த இடம்","ராஜஸ்தானின் மேர்தா மாவட்டம் குத்"),
(195,"relation","Relation of Mirabai to Rana Jodhaji","Great-granddaughter","மீராபாயின் ராணா ஜோதாஜியுடனான உறவு","பேரப்பேத்தியின் மகள்"),
(195,"person","Founder of Jodhpur identified as Mirabai's ancestor","Rana Jodhaji","மீராபாயின் முன்னோராகக் குறிப்பிடப்பட்ட ஜோத்பூர் நிறுவனர்","ராணா ஜோதாஜி"),
(195,"spouse","Husband of Mirabai","Bhoj Raj","மீராபாயின் கணவர்","போஜ் ராஜ்"),
(195,"relation","Bhoj Raj's father","Rana Sanga of Mewar","போஜ் ராஜின் தந்தை","மேவாரின் ராணா சங்கா"),
(195,"deity","Deity to whom Mirabai was devoted","Krishna","மீராபாய் பக்தியுற்ற தெய்வம்","கிருஷ்ணர்"),
(195,"form","Devotional song form associated with Mirabai","Bhajans","மீராபாயுடன் தொடர்புடைய பக்திப் பாடல் வடிவம்","பஜன்கள்"),
(195,"principle","Grounds on which Mirabai said nobody should be deprived of divine grace","Birth, poverty, age or sex","இறையருள் மறுக்கப்படக் கூடாத காரணிகள்","பிறப்பு, வறுமை, வயது அல்லது பாலினம்"),
(195,"saint","Bhakti poet known as the blind bard of Agra","Sur Das","ஆக்ராவின் பார்வையற்ற பாணர் என அறியப்பட்ட பக்திக் கவிஞர்","சூர்தாஸ்"),
(195,"court","Mughal court in which Sur Das lived according to the textbook","Akbar's court","பாடநூலின்படி சூர்தாஸ் வாழ்ந்த முகலாய அரசவை","அக்பரின் அரசவை"),
(195,"teacher","Vaishnava preacher believed to be the teacher of Sur Das","Vallabhacharya","சூர்தாஸின் ஆசானாகக் கருதப்படும் வைணவப் போதகர்","வல்லபாச்சாரியர்"),
(195,"sect","Path founded by Vallabhacharya","Pushtimarga","வல்லபாச்சாரியர் நிறுவிய மார்க்கம்","புஷ்டிமார்க்கம்"),
(195,"theme","First great theme of Sur Das's poetry","Krishna's Bal Lila","சூர்தாஸ் கவிதைகளின் முதல் பெரிய கரு","கிருஷ்ணரின் பால லீலை"),
(195,"work","Popular work of Sur Das","Sur Sagar","சூர்தாஸின் புகழ்பெற்ற நூல்","சூர் சாகர்"),
(195,"work","Popular work of Sur Das","Sur Saravali","சூர்தாஸின் புகழ்பெற்ற நூல்","சூர் சாராவலி"),
(195,"work","Popular work of Sur Das","Sahitya Lahari","சூர்தாஸின் புகழ்பெற்ற நூல்","சாகித்திய லஹரி"),
(195,"scope","Narrative span of Sur Sagar","Krishna's birth to departure for Mathura","சூர் சாகர் விவரிக்கும் கதை வரம்பு","கிருஷ்ணர் பிறந்தது முதல் மதுரா புறப்பட்டது வரை"),
(195,"date","Year of Tukaram's birth","1608","துக்காராம் பிறந்த ஆண்டு","1608"),
(195,"place","Region near which Tukaram was born","Near Poona, Maharashtra","துக்காராம் பிறந்த பகுதி","மகாராஷ்டிரத்தின் பூனே அருகில்"),
(195,"contemporary","Maratha ruler contemporary with Tukaram","Shivaji","துக்காராமின் சமகால மராத்திய அரசர்","சிவாஜி"),
(195,"contemporary","Saint contemporary with Tukaram","Eknath","துக்காராமின் சமகால சான்றோர்","ஏக்நாத்"),
(195,"contemporary","Saint contemporary with Tukaram","Ramdas","துக்காராமின் சமகால சான்றோர்","ராமதாஸ்"),
(195,"occupation","Early occupation of Tukaram","Trader","துக்காராமின் ஆரம்ப தொழில்","வணிகர்"),
(195,"deity","Favourite deity of Tukaram","Vithoba of Pandarpur","துக்காராமின் விருப்பத் தெய்வம்","பண்டர்பூரின் வித்தோபா"),
(196,"concept","Form of God believed in by Tukaram","Formless God","துக்காராம் நம்பிய கடவுளின் வடிவம்","உருவமற்ற கடவுள்"),
(196,"principle","Divine quality stressed by Tukaram","All-pervasiveness of God","துக்காராம் வலியுறுத்திய இறைத் தன்மை","கடவுளின் எங்கும் நிறைவு"),
(196,"critique","Vedic practice rejected by Tukaram","Vedic sacrifices","துக்காராம் நிராகரித்த வேத நடைமுறை","வேத யாகங்கள்"),
(196,"critique","Religious practice rejected by Tukaram","Ceremonies","துக்காராம் நிராகரித்த சமய நடைமுறை","சடங்குகள்"),
(196,"critique","Religious practice rejected by Tukaram","Pilgrimages","துக்காராம் நிராகரித்த சமய நடைமுறை","யாத்திரைகள்"),
(196,"critique","Religious practice rejected by Tukaram","Idol worship","துக்காராம் நிராகரித்த சமய நடைமுறை","சிலை வழிபாடு"),
(196,"virtue","Virtue preached by Tukaram","Piety","துக்காராம் போதித்த நற்பண்பு","பக்தி நெறி"),
(196,"virtue","Virtue preached by Tukaram","Forgiveness","துக்காராம் போதித்த நற்பண்பு","மன்னிப்பு"),
(196,"virtue","Virtue preached by Tukaram","Peace of mind","துக்காராம் போதித்த நற்பண்பு","மன அமைதி"),
(196,"social","Social ideal spread by Tukaram","Equality and brotherhood","துக்காராம் பரப்பிய சமூக இலக்கு","சமத்துவமும் சகோதரத்துவமும்"),
(196,"social","Communal objective pursued by Tukaram","Hindu-Muslim unity","துக்காராம் முயன்ற சமய ஒற்றுமை","இந்து-முஸ்லிம் ஒற்றுமை"),
(196,"language","Language of Tukaram's abhangas","Marathi","துக்காராமின் அபங்கங்கள் எழுதப்பட்ட மொழி","மராத்தி"),
(196,"impact","Group newly included in access to salvation through the Bhakti movement","Women","பக்தி இயக்கம் முக்திப் பாதையில் இணைத்த முக்கியக் குழு","பெண்கள்"),
(196,"impact","Social sections newly included in access to salvation through the Bhakti movement","Lower strata of society","பக்தி இயக்கம் முக்திப் பாதையில் இணைத்த சமூகப் பிரிவுகள்","சமூகத்தின் கீழ்தட்டு மக்கள்"),
(196,"literature","Literary result of the Bhakti movement","Growth of devotional songs in regional languages","பக்தி இயக்கத்தின் இலக்கிய விளைவு","பிராந்திய மொழிகளில் பக்திப் பாடல்களின் பெருக்கம்"),
(196,"philosophy","Theistic dualist position represented in the range of Bhakti philosophies","Dvaita","பக்தி தத்துவங்களின் வரம்பில் உள்ள இருமைவாத நிலை","துவைதம்"),
(196,"philosophy","Absolute monist position represented in the range of Bhakti philosophies","Advaita","பக்தி தத்துவங்களின் வரம்பில் உள்ள முழுமையான ஒருமைவாத நிலை","அத்வைதம்"),
(196,"practice","Regional Bhakti practice surviving to the present","Community singing","இன்றும் தொடரும் பக்தி மரபுப் பயிற்சி","கூட்டுப் பாடல்"),
(196,"practice","Regional Bhakti practice surviving to the present","Chanting deity names together","இன்றும் தொடரும் பக்தி மரபுப் பயிற்சி","தெய்வநாமங்களை சேர்ந்து ஜெபித்தல்"),
(196,"practice","Regional Bhakti practice surviving to the present","Festivals","இன்றும் தொடரும் பக்தி மரபுப் பயிற்சி","திருவிழாக்கள்"),
(196,"practice","Regional Bhakti practice surviving to the present","Pilgrimages","இன்றும் தொடரும் பக்தி மரபுப் பயிற்சி","யாத்திரைகள்"),
(196,"practice","Regional Bhakti practice surviving to the present","Saiva and Vaishnava rituals","இன்றும் தொடரும் பக்தி மரபுப் பயிற்சி","சைவ-வைணவ சடங்குகள்"),

(198,"term","Meaning of syncretism in the glossary","Amalgamation of different religions and cultures","கலைச்சொல் பகுதியில் Syncretism என்பதன் பொருள்","பல்வேறு மதங்களும் பண்பாடுகளும் கலப்பது"),
(198,"term","Meaning of hagiographical in the glossary","Flattering account about the lives of saints","கலைச்சொல் பகுதியில் Hagiographical என்பதன் பொருள்","திருத்தொண்டர் வாழ்க்கையைப் புகழ்ந்து கூறும் வரலாறு"),
(198,"term","Meaning of intuitive in the glossary","Feeling to be true without conscious reasoning","கலைச்சொல் பகுதியில் Intuitive என்பதன் பொருள்","விழிப்புணர்ந்த காரணமின்றி உண்மை என உணரும் உள்ளுணர்வு"),
(198,"term","Meaning of bard in the glossary","Poet","கலைச்சொல் பகுதியில் Bard என்பதன் பொருள்","பாணர் அல்லது கவிஞர்"),
(198,"term","Meaning of sublimate in the glossary","Purify","கலைச்சொல் பகுதியில் Sublimate என்பதன் பொருள்","புனிதமாக்கு"),
(198,"term","Meaning of pervasiveness in the glossary","Presence felt throughout","கலைச்சொல் பகுதியில் Pervasiveness என்பதன் பொருள்","எங்கும் நிறைந்திருத்தல்"),
(198,"term","Meaning of ecstatic in the glossary","Joyful or blissful","கலைச்சொல் பகுதியில் Ecstatic என்பதன் பொருள்","பேரானந்தம் அல்லது களிப்பு"),
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

def opts(f,seed):
    arr=[f]+distractors(f)
    random.Random(seed).shuffle(arr)
    return [x["ans_en"] for x in arr],[x["ans_ta"] for x in arr],arr.index(f)

questions=[]; qid=1
def add(page,qen,qta,oe,ot,c,een,eta,typ):
    global qid
    questions.append({"id":f"C11H13-Q{qid:03d}","quiz":(qid-1)//20+1,"page_en":page,
      "q_en":qen,"q_ta":qta,"opts_en":oe,"opts_ta":ot,"correct":c,
      "exp_en":een,"exp_ta":eta,"type":typ})
    qid+=1

for i,f in enumerate(facts):
    oe,ot,c=opts(f,13000+i*13)
    een=f'{f["desc_en"]}: {f["ans_en"]}.'
    eta=f'{f["desc_ta"]}: {f["ans_ta"]}.'
    add(f["page_en"],f'What is the correct textbook answer for: {f["desc_en"]}?',
        f'இதற்கான சரியான பாடநூல் விடை எது: {f["desc_ta"]}?',
        oe,ot,c,een,eta,"direct")
    oe2,ot2,c2=opts(f,23000+i*19)
    add(f["page_en"],f'Which option is correctly associated with the following description: {f["desc_en"]}?',
        f'பின்வரும் விளக்கத்துடன் சரியாகப் பொருந்தும் விடை எது: {f["desc_ta"]}?',
        oe2,ot2,c2,een,eta,"association")

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

# Remove any accidental exact duplicate question+option combinations, then renumber.
unique=[]; seen_q=set()
for q in questions:
    s=(q["q_en"],tuple(q["opts_en"]))
    if s in seen_q: continue
    seen_q.add(s)
    unique.append(q)
questions=unique
for i,q in enumerate(questions,1):
    q["id"]=f"C11H13-Q{i:03d}"
    q["quiz"]=(i-1)//20+1

quiz_count=(len(questions)+19)//20
sets=[{"id":i,"title_en":f"Quiz {i} · Competitive Review","title_ta":f"வினாடி வினா {i} · போட்டித் தேர்வு மீள்பார்வை"} for i in range(1,quiz_count+1)]
counts=Counter("ABCD"[q["correct"]] for q in questions)
sigs=set(); dups=0
for q in questions:
    s=(q["q_en"],tuple(q["opts_en"]))
    if s in sigs: dups+=1
    sigs.add(s)

out={"meta":{
 "board":"Tamil Nadu State Board","class":11,"subject":"History","edition":2025,"unit":13,
 "unit_en":"Cultural Syncretism: Bhakti Movement in India",
 "unit_ta":"பண்பாட்டு ஒருமைப்பாடு: இந்தியாவில் பக்தி இயக்கம்",
 "source":"Government of Tamil Nadu Higher Secondary First Year History, Revised Edition 2025, English and Tamil editions supplied by the user",
 "total_questions":len(questions),"base_facts":len(facts),"quiz_sets":sets,
 "question_style":"Maximum useful source-grounded bilingual competitive-exam coverage from Unit 13: origins and southern phase of Bhakti, Saiva-Vaishnava sources and conflicts, Ramanuja and northern spread, Sufism, salient Bhakti principles, Kabir, Ravidas, Guru Nanak, Chaitanya, Namadeva, Ramananda, Mirabai, Sur Das, Tukaram and the movement's social-cultural impact.",
 "quality_policy":"Four-option bilingual MCQs grounded in the supplied 2025 English and Tamil textbooks. Activities and low-value procedural material are excluded. Distinct textbook facts are reinforced through direct recall, association and statement-analysis formats.",
 "page_reference_note":"page_en refers to the printed English textbook page.",
 "qa_all_four_options":all(len(q["opts_en"])==4 and len(q["opts_ta"])==4 for q in questions),
 "qa_valid_correct_indexes":all(0<=q["correct"]<4 for q in questions),
 "qa_duplicate_ids":len(questions)-len({q["id"] for q in questions}),
 "qa_exact_duplicate_question_options":dups,
 "qa_answer_position_counts":dict(counts)
},"questions":questions}

os.makedirs(os.path.dirname(OUT),exist_ok=True)
with open(OUT,"w",encoding="utf-8") as fp: json.dump(out,fp,ensure_ascii=False,indent=2)
print(f"Wrote {OUT}: {len(facts)} facts, {len(questions)} questions, {quiz_count} quizzes")
