import json, random, os
from collections import defaultdict, Counter

OUT="data/textbook/class-11/history/unit-18.json"
random.seed(1802026)

RAW=r"""
279|concept|Historians' term for rebellions of deposed kings, descendants, uprooted zamindars and palayakkarars|Primary resistance|பதவி நீக்கப்பட்ட அரசர்கள், வாரிசுகள், வெளியேற்றப்பட்ட ஜமீன்தார்கள், பாளையக்காரர்களின் கிளர்ச்சிகளுக்கான வரலாற்றாசிரியர்களின் சொல்|ஆரம்பநிலை எதிர்ப்பு
279|cause|British changes that disrupted agrarian economy|Agrarian relations, land revenue and judicial administration|வேளாண் பொருளாதாரத்தை சீர்குலைத்த ஆங்கிலேய மாற்றங்கள்|வேளாண் உறவுகள், நிலவருவாய் முறை மற்றும் நீதி நிர்வாக மாற்றங்கள்
279|support|Groups that supported aggrieved former rulers in revolts|Peasants and artisans|மனக்கொதிப்புற்ற முன்னாள் ஆட்சியாளர்களுக்கு ஆதரவளித்த குழுக்கள்|விவசாயிகளும் கைவினைஞர்களும்
279|kingdom|Mysore's political status under Vijayanagara|Small feudatory kingdom|விஜயநகரப் பேரரசின் கீழ் மைசூரின் நிலை|சிறு நிலமானிய அரசு
279|date|Year Vijayanagara fell according to the lesson|1565|விஜயநகரப் பேரரசு வீழ்ந்த ஆண்டு|1565
279|dynasty|Dynasty that asserted independence in Mysore after Vijayanagara's fall|Wodeyars|விஜயநகர வீழ்ச்சிக்குப் பின் மைசூரில் சுதந்திரம் அறிவித்த வம்சம்|உடையார் வம்சம்
279|person|Ruler who ascended Mysore throne in 1578|Raja Wodeyar|1578இல் மைசூர் அரியணை ஏறியவர்|ராஜா உடையார்
279|date|Year Raja Wodeyar ascended throne|1578|ராஜா உடையார் அரியணை ஏறிய ஆண்டு|1578
279|capital|Capital to which Mysore was shifted in 1610|Srirangapatnam|1610இல் மைசூர் தலைநகரம் மாற்றப்பட்ட இடம்|ஸ்ரீரங்கப்பட்டணம்
279|date|Year capital moved to Srirangapatnam|1610|தலைநகரம் ஸ்ரீரங்கப்பட்டணத்திற்கு மாற்றப்பட்ட ஆண்டு|1610
279|date|Year real power in Mysore passed to Haider Ali|1760|மைசூரின் உண்மையான அதிகாரம் ஹைதர் அலிக்கு சென்ற ஆண்டு|1760
279|person|Father of Haider Ali|Fateh Muhammad|ஹைதர் அலியின் தந்தை|ஃபதே முகமது
279|office|Office held by Fateh Muhammad at Kolar|Faujdar (garrison commander)|கோலாரில் ஃபதே முகமது வகித்த பதவி|பௌஜ்தார் / கோட்டைக் காவற்படைத் தளபதி
279|number|Horsemen commanded by Haider in 1755|100|1755இல் ஹைதர் கட்டுப்பாட்டில் இருந்த குதிரைப்படையினர்|100
279|number|Infantry commanded by Haider in 1755|2000|1755இல் ஹைதர் கட்டுப்பாட்டில் இருந்த காலாட்படையினர்|2000
280|title|Title received by Haider after restoring Mysore territories|Fateh Haider Bahadur|மைசூர் பகுதிகளை மீட்ட பின் ஹைதர் பெற்ற பட்டம்|ஃபதே ஹைதர் பகதூர்
280|meaning|Meaning attached to Fateh Haider Bahadur|The brave and victorious Lion|ஃபதே ஹைதர் பகதூர் பட்டத்தின் பொருள்|துணிவும் வெற்றியும் கொண்ட சிங்கம்
280|date|Year Haider allied with the French at Pondicherry|1760|புதுச்சேரி பிரெஞ்சுக்காரர்களுடன் ஹைதர் கூட்டணி அமைத்த ஆண்டு|1760
280|office|Position held by Haider before becoming de facto ruler|Dalawai|உண்மையான ஆட்சியாளராகுமுன் ஹைதர் வகித்த பதவி|தளவாய்
280|status|Haider's political status after overcoming Maratha plot|De facto ruler of Mysore|மராத்திய சதியை சமாளித்த பின் ஹைதரின் நிலை|மைசூரின் உண்மையான ஆட்சியாளர்
280|person|Mysore king poisoned in 1770|Nanjaraja|1770இல் விஷம் கொடுக்கப்பட்ட மைசூர் மன்னர்|நஞ்சராஜா
280|date|Year Nanjaraja died|1770|நஞ்சராஜா இறந்த ஆண்டு|1770
280|policy|Warren Hastings' buffer-state policy|Ring Fence|வாரன் ஹேஸ்டிங்ஸின் இடைநிலை அரசு கொள்கை|ரிங் ஃபென்ஸ்
280|region|Region whose Nawabship struggles drew Company into local politics|Carnatic|நவாப் பதவி மோதல்கள் கம்பெனியை தலையீடு செய்ய வைத்த பகுதி|கர்நாடகம்
280|power|One major power threatening English expansion in the south|Haider Ali|தெற்கில் ஆங்கிலேய விரிவாக்கத்திற்கு அச்சுறுத்தலான சக்தி|ஹைதர் அலி
280|power|Another major power threatening English expansion|Nizam of Hyderabad|ஆங்கிலேய விரிவாக்கத்திற்கு அச்சுறுத்தலான மற்றொரு சக்தி|ஹைதராபாத் நிஜாம்
280|war|War in which Colonel Forde captured Masulipatnam|Third Carnatic War|கர்னல் ஃபோர்டு மசூலிப்பட்டினத்தை கைப்பற்றிய போர்|மூன்றாம் கர்நாடகப் போர்
280|person|British officer who captured Masulipatnam in 1759|Colonel Forde|1759இல் மசூலிப்பட்டினத்தை கைப்பற்றிய ஆங்கில அதிகாரி|கர்னல் ஃபோர்டு
280|date|Year Masulipatnam was captured by Forde|1759|மசூலிப்பட்டினம் ஃபோர்டால் கைப்பற்றப்பட்ட ஆண்டு|1759
280|person|Nizam who ceded Northern Sarkars to British|Salabat Jung|வடக்கு சர்க்கார்களை ஆங்கிலேயருக்கு ஒப்படைத்த நிஜாம்|சலாபத் ஜங்
280|region|One district of Northern Sarkars ceded to British|Ganjam|ஆங்கிலேயருக்கு ஒப்படைக்கப்பட்ட வடக்கு சர்க்கார் மாவட்டம்|கஞ்சம்
280|region|One district of Northern Sarkars ceded to British|Vizagapatnam|ஆங்கிலேயருக்கு ஒப்படைக்கப்பட்ட வடக்கு சர்க்கார் மாவட்டம்|விசாகப்பட்டினம்
280|region|One district of Northern Sarkars ceded to British|Godavari|ஆங்கிலேயருக்கு ஒப்படைக்கப்பட்ட வடக்கு சர்க்கார் மாவட்டம்|கோதாவரி
280|region|One district of Northern Sarkars ceded to British|Krishna|ஆங்கிலேயருக்கு ஒப்படைக்கப்பட்ட வடக்கு சர்க்கார் மாவட்டம்|கிருஷ்ணா
280|region|One district of Northern Sarkars ceded to British|Guntur|ஆங்கிலேயருக்கு ஒப்படைக்கப்பட்ட வடக்கு சர்க்கார் மாவட்டம்|குண்டூர்
280|treaty|Treaty legalizing British acquisition of Northern Sarkars|Treaty of Allahabad|வடக்கு சர்க்கார்களை ஆங்கிலேயர் பெற்றதை சட்டபூர்வமாக்கிய உடன்படிக்கை|அலகாபாத் உடன்படிக்கை
280|date|Year Mughal emperor legalized Northern Sarkars acquisition|1765|வடக்கு சர்க்கார் ஆங்கிலேயருக்குச் சட்டபூர்வமாக்கப்பட்ட ஆண்டு|1765
280|person|Nizam who accepted British occupation in 1766|Nizam Ali|1766இல் ஆங்கிலேயர் ஆக்கிரமிப்பை ஏற்ற நிஜாம்|நிஜாம் அலி
280|date|Year Nizam Ali treaty preceded First Mysore War|1766|நிஜாம் அலி உடன்படிக்கை நடந்த ஆண்டு|1766
280|system|Later policy whose genesis lay in British promise to aid Nizam|Subsidiary System|நிஜாமுக்கு ஆங்கிலேய உதவி வாக்குறுதியில் விதை பெற்ற பிற்கால முறை|துணைப்படை முறை
280|date|Year Nizam reached understanding with Haider|1767|நிஜாம் ஹைதருடன் புரிந்துணர்வு கொண்ட ஆண்டு|1767
280|war|Other name for First Mysore War|First Anglo-Mysore War|முதல் மைசூர் போரின் மற்றொரு பெயர்|முதல் ஆங்கிலோ-மைசூர் போர்
280|period|First Mysore War period|1767–1769|முதல் மைசூர் போரின் காலம்|1767–1769
280|port|West-coast place captured by Bombay army in First Mysore War|Mangalore|முதல் மைசூர் போரில் பம்பாய் படை கைப்பற்றிய மேற்குக் கடற்கரை இடம்|மங்களூர்
280|place|City English unsuccessfully tried to capture in First Mysore War|Bangalore|முதல் மைசூர் போரில் ஆங்கிலேயர் கைப்பற்றத் தவறிய நகரம்|பெங்களூர்
280|region|Region Haider attacked in 1768|Baramahal (Salem district)|1768இல் ஹைதர் தாக்கிய பகுதி|பாரமஹால் (சேலம்)
280|place|Town captured by Haider after marching from Baramahal|Karur|பாரமஹாலிலிருந்து நகர்ந்து ஹைதர் கைப்பற்றிய இடம்|கரூர்
280|place|Town captured by Haider after Karur|Erode|கரூருக்குப் பின் ஹைதர் கைப்பற்றிய இடம்|ஈரோடு
280|person|British captain defeated by Haider at Karur/Erode operations|Captain Nixon|கரூர்-ஈரோடு நடவடிக்கையில் ஹைதரால் தோற்கடிக்கப்பட்ட ஆங்கில அதிகாரி|கேப்டன் நிக்சன்
280|person|Haider's general who marched on Madurai and Tirunelveli|Fazalullah Khan|மதுரை மற்றும் திருநெல்வேலிக்குச் சென்ற ஹைதரின் தளபதி|ஃபசலுல்லா கான்
280|place|Place from which Haider advanced to Cuddalore|Thanjavur|கடலூருக்கு முன் ஹைதர் சென்ற இடம்|தஞ்சாவூர்
280|cause|Reason Haider negotiated peace in First Mysore War|Threat of Maratha invasion|முதல் மைசூர் போரில் ஹைதர் அமைதி பேச்சு நடத்திய காரணம்|மராத்தியர் படையெடுப்பு அச்சுறுத்தல்
280|treaty|Treaty ending First Mysore War|Treaty of Madras|முதல் மைசூர் போரைக் முடித்த உடன்படிக்கை|மதராஸ் உடன்படிக்கை
280|territory|Territory retained by Haider under Treaty of Madras|Karur|மதராஸ் உடன்படிக்கையில் ஹைதர் வைத்துக் கொண்ட பகுதி|கரூர்
280|clause|Key defence clause of Treaty of Madras|Mutual assistance in defensive wars|மதராஸ் உடன்படிக்கையின் முக்கிய பாதுகாப்பு விதி|பாதுகாப்புப் போர்களில் பரஸ்பர உதவி
280|cause|Why Haider later turned against English|English failed to help him against Marathas|ஹைதர் பின்னர் ஆங்கிலேயருக்கு எதிரான காரணம்|மராத்தியருக்கு எதிராக ஆங்கிலேயர் உதவவில்லை
280|war|War associated with Haider's campaign of 1780–84|Second Mysore War|1780–84 ஹைதர் போராட்டத்துடன் தொடர்புடைய போர்|இரண்டாம் மைசூர் போர்
280|period|Second Mysore War period|1780–1784|இரண்டாம் மைசூர் போரின் காலம்|1780–1784
280|date|Year France signed friendship treaty with America|1778|பிரான்ஸ் அமெரிக்காவுடன் நட்பு உடன்படிக்கை செய்த ஆண்டு|1778
280|date|Year Spain was drawn into war against England|1779|ஸ்பெயின் இங்கிலாந்துக்கு எதிரான போரில் இழுக்கப்பட்ட ஆண்டு|1779
281|person|British officer badly wounded in Haider's sudden attack|Colonel Baillie|ஹைதரின் திடீர் தாக்குதலில் கடுமையாக காயமடைந்த ஆங்கில அதிகாரி|கர்னல் பெய்லி
281|person|Commander Baillie was supposed to join|Hector Munro|பெய்லி சேர வேண்டிய படைத் தளபதி|ஹெக்டர் மன்றோ
281|place|Major town captured by Haider in 1780|Arcot|1780இல் ஹைதர் கைப்பற்றிய முக்கிய நகரம்|ஆர்க்காடு
281|person|Victor of Wandiwash sent from Calcutta against Haider|Sir Eyre Coote|ஹைதருக்கு எதிராக கல்கத்தாவிலிருந்து அனுப்பப்பட்ட வந்தவாசி வெற்றியாளர்|சர் ஐர் கூட்
281|battle|Decisive battle in which Eyre Coote defeated Haider|Porto Novo|ஐர் கூட் ஹைதரைத் தீர்மானமாக தோற்கடித்த போர்|போர்டோ நோவோ
281|person|British officer defeated near Kumbakonam and captured by Tipu|Colonel Braithwaite|கும்பகோணம் அருகே திப்புவால் தோற்கடிக்கப்பட்டு பிடிக்கப்பட்ட ஆங்கில அதிகாரி|கர்னல் பிரைத்த்வெய்ட்
281|person|Commander sent to capture Mangalore to divert Tipu|General Mathews|திப்புவின் கவனத்தை மாற்ற மங்களூரைக் கைப்பற்ற அனுப்பப்பட்ட தளபதி|ஜெனரல் மேத்யூஸ்
281|disease|Cause of Haider Ali's death|Cancer|ஹைதர் அலி இறந்த காரணம்|புற்றுநோய்
281|date|Year Haider Ali died|1782|ஹைதர் அலி இறந்த ஆண்டு|1782
281|treaty|Treaty ending American War of Independence mentioned in lesson|Treaty of Paris|அமெரிக்க விடுதலைப் போரின் முடிவுடன் தொடர்புடைய உடன்படிக்கை|பாரிஸ் உடன்படிக்கை
281|date|Year Treaty of Paris mentioned with Second Mysore War|1783|இரண்டாம் மைசூர் போருடன் குறிப்பிடப்பட்ட பாரிஸ் உடன்படிக்கை ஆண்டு|1783
281|person|British officer who captured Karur and Dindigul|Colonel Lang|கரூர் மற்றும் திண்டுக்கல்லை கைப்பற்றிய ஆங்கில அதிகாரி|கர்னல் லாங்
281|person|British officer who seized Palghat and Coimbatore|Colonel Fullerton|பாலக்காடு மற்றும் கோயம்புத்தூரை கைப்பற்றிய ஆங்கில அதிகாரி|கர்னல் ஃபுல்லர்டன்
281|treaty|Treaty ending Second Mysore War|Treaty of Mangalore|இரண்டாம் மைசூர் போரைக் முடித்த உடன்படிக்கை|மங்களூர் உடன்படிக்கை
281|date|Month and year Treaty of Mangalore signed|March 1784|மங்களூர் உடன்படிக்கை கையெழுத்தான மாதம் மற்றும் ஆண்டு|மார்ச் 1784
281|clause|Main terms of Treaty of Mangalore|Restore conquests and release prisoners|மங்களூர் உடன்படிக்கையின் முக்கிய விதிகள்|கைப்பற்றிய பகுதிகளைத் திருப்பி வழங்குதல் மற்றும் கைதிகளை விடுவித்தல்
281|person|Governor-General who sought revenge against Tipu|Lord Cornwallis|திப்புவை பழிவாங்கும் மனப்பாங்குடன் அணுகிய கவர்னர் ஜெனரல்|லார்ட் காரன்வாலிஸ்
281|ally|Southern power allied with British in Third Mysore War|Nizam of Hyderabad|மூன்றாம் மைசூர் போரில் ஆங்கிலேயருடன் இணைந்த தெற்குச் சக்தி|ஹைதராபாத் நிஜாம்
281|ally|Confederacy allied with British in Third Mysore War|Maratha confederacy|மூன்றாம் மைசூர் போரில் ஆங்கிலேயருடன் இணைந்த கூட்டமைப்பு|மராத்திய கூட்டமைப்பு
281|treaty|Treaty after which Marathas joined British side|Treaty of Salbai|மராத்தியர்கள் ஆங்கிலேயருடன் இணைவதற்கு முன் செய்த உடன்படிக்கை|சால்பாய் உடன்படிக்கை
281|date|Year Tipu sent embassy to Paris|1787|திப்பு பாரிஸுக்கு தூதுக்குழு அனுப்பிய ஆண்டு|1787
281|capital|City to which Tipu also sent an embassy|Constantinople|திப்பு மற்றொரு தூதுக்குழு அனுப்பிய நகரம்|கான்ஸ்டான்டினோபிள்
281|person|French monarch who received Tipu's embassy|Louis XVI|திப்புவின் தூதுக்குழுவை ஏற்ற பிரெஞ்சு மன்னர்|பதினாறாம் லூயி
281|place|British ally attacked by Tipu triggering Third Mysore War|Travancore|திப்புவின் தாக்குதலால் மூன்றாம் மைசூர் போர் தொடங்க காரணமான ஆங்கிலேய கூட்டாளர்|திருவிதாங்கூர்
281|place|Fort/place captured by Tipu triggering war|Cranganore (Kodungallur)|திப்பு கைப்பற்றியதால் போர் வெடித்த இடம்|கொடுங்கல்லூர்
281|period|Third Mysore War period|1790–1792|மூன்றாம் மைசூர் போரின் காலம்|1790–1792
281|person|British officer who defeated Tipu's general Husain Ali at Calicut|Colonel Hartley|காலிக்கட்டில் ஹுசைன் அலியை தோற்கடித்த ஆங்கில அதிகாரி|கர்னல் ஹார்ட்லி
281|person|Tipu's general defeated at Calicut|Husain Ali|காலிக்கட்டில் தோற்கடிக்கப்பட்ட திப்புவின் தளபதி|ஹுசைன் அலி
281|place|Town captured by Tipu in response|Tiruvannamalai|திப்பு பதிலடியாக கைப்பற்றிய நகரம்|திருவண்ணாமலை
281|person|Governor-General who marched from Vellore to Bangalore|Cornwallis|வேலூரிலிருந்து பெங்களூருக்கு படையெடுத்தவர்|காரன்வாலிஸ்
281|cause|Why Cornwallis first retreated near Srirangapatnam|Lack of provisions|ஸ்ரீரங்கப்பட்டணம் அருகே காரன்வாலிஸ் முதலில் பின்வாங்கிய காரணம்|உணவுப்பொருள் மற்றும் வழங்கல் பற்றாக்குறை
281|support|Who supplied provisions to Cornwallis at this juncture|Marathas|காரன்வாலிஸுக்கு தேவையான வழங்கலை கொடுத்தோர்|மராத்தியர்கள்
282|treaty|Treaty ending Third Mysore War|Treaty of Srirangapatnam|மூன்றாம் மைசூர் போரைக் முடித்த உடன்படிக்கை|ஸ்ரீரங்கப்பட்டணம் உடன்படிக்கை
282|territory|Share of dominions Tipu had to surrender|Half of his dominions|திப்பு ஒப்படைக்க வேண்டிய நாட்டின் பங்கு|அரைக் பகுதி
282|indemnity|Indemnity imposed on Tipu|Three crores of rupees|திப்புவுக்கு விதிக்கப்பட்ட போர் இழப்பீடு|மூன்று கோடி ரூபாய்
282|hostage|Number of Tipu's sons pledged as hostages|Two|பிணையாக ஒப்படைக்கப்பட்ட திப்புவின் மகன்கள் எண்ணிக்கை|இரண்டு
282|territory|One territory obtained by English after Third Mysore War|Malabar|மூன்றாம் மைசூர் போருக்குப் பின் ஆங்கிலேயர் பெற்ற பகுதி|மலபார்
282|territory|One territory obtained by English after Third Mysore War|Dindigul|மூன்றாம் மைசூர் போருக்குப் பின் ஆங்கிலேயர் பெற்ற பகுதி|திண்டுக்கல்
282|territory|One territory obtained by English after Third Mysore War|Baramahal|மூன்றாம் மைசூர் போருக்குப் பின் ஆங்கிலேயர் பெற்ற பகுதி|பாரமஹால்
282|territory|Territory lost by Tipu whose Raja became Company feudatory|Coorg (Kudagu)|திப்புவிடமிருந்து பிரிந்து கம்பெனி சார்பு அரசாக மாறிய பகுதி|கூர்க் / குடகு
282|date|Date Tipu's hostage sons returned to Srirangapatnam|29 May 1794|பிணை மகன்கள் ஸ்ரீரங்கப்பட்டணம் திரும்பிய தேதி|29 மே 1794
282|person|Mysore king who died in 1796|Chamaraj IX|1796இல் இறந்த மைசூர் மன்னர்|ஒன்பதாம் சாமராஜ்
282|person|French colonial Governor of Mauritius mentioned in Tipu diplomacy|General Malartic|திப்புவின் பிரெஞ்சு தொடர்பில் குறிப்பிடப்பட்ட மொரீஷியஸ் ஆளுநர்|ஜெனரல் மலார்டிக்
282|date|Month and year Tipu's correspondence with French Directory noted|July 1798|பிரெஞ்சு டைரக்டரியுடன் திப்புவின் தொடர்பு குறிப்பிடப்பட்ட காலம்|ஜூலை 1798
282|person|European leader with whom Tipu corresponded|Napoleon|திப்பு தொடர்பு கொண்ட ஐரோப்பிய தலைவர்|நெப்போலியன்
282|period|Fourth Mysore War year|1799|நான்காம் மைசூர் போரின் ஆண்டு|1799
282|date|Year Tipu again sent emissaries to Paris|1796|திப்பு மீண்டும் பாரிஸுக்கு தூதர்களை அனுப்பிய ஆண்டு|1796
282|date|Year Tipu received a French emissary from Mauritius|1797|மொரீஷியஸிலிருந்து பிரெஞ்சு தூதரை திப்பு பெற்ற ஆண்டு|1797
282|club|Political club started at Srirangapatnam|Jacobin Club|ஸ்ரீரங்கப்பட்டணத்தில் தொடங்கப்பட்ட அரசியல் கழகம்|ஜாக்கோபின் கழகம்
282|symbol|Flag hoisted at Srirangapatnam to mark French cordiality|Flag of the French Republic|பிரெஞ்சு நட்பை குறிக்க ஏற்றப்பட்ட கொடி|பிரெஞ்சு குடியரசுக் கொடி
282|person|Governor-General who demanded standing army in Mysore under Subsidiary System|Wellesley|துணைப்படை முறையில் மைசூரில் நிலையான படை கோரிய கவர்னர் ஜெனரல்|வெல்லெஸ்லி
282|person|British general who stormed Srirangapatnam in 1799|General David Baird|1799இல் ஸ்ரீரங்கப்பட்டணத்தை தாக்கிய ஆங்கில தளபதி|ஜெனரல் டேவிட் பேயர்ட்
282|fate|Fate of Tipu Sultan in Fourth Mysore War|Killed in battle at Srirangapatnam|நான்காம் மைசூர் போரில் திப்புவின் முடிவு|ஸ்ரீரங்கப்பட்டணம் போரில் கொல்லப்பட்டார்
282|effect|Event marking real beginning of Company rule in south India|Elimination of Tipu and restoration of Wodeyars|தென்னிந்தியாவில் கம்பெனி ஆட்சியின் உண்மையான தொடக்கத்தை குறித்த நிகழ்வு|திப்பு நீக்கப்பட்டு உடையார் வம்சம் மீள நிறுவப்பட்டது
282|place|First place where Tipu's sons were interned|Vellore|திப்புவின் மகன்கள் முதலில் சிறை வைக்கப்பட்ட இடம்|வேலூர்
282|place|Place to which Tipu's sons were shifted after Vellore Revolt|Calcutta|வேலூர் கிளர்ச்சிக்குப் பின் திப்புவின் மகன்கள் மாற்றப்பட்ட இடம்|கல்கத்தா

282|person|Viceroy to Madurai after Vijayanagara decline|Nagama Nayak|விஜயநகர வீழ்ச்சிக்குப் பின் மதுரைக்கு வந்த வைஸ்ராய்|நாகம நாயக்
282|person|Son of Nagama Nayak who asserted independent rule|Viswanatha Nayak|நாகம நாயக்கின் மகனாக சுயாட்சி நிலைநிறுத்தியவர்|விசுவநாத நாயக்
282|person|Prime minister who guided organisation of palayams|Ariyanatha Mudaliyar|பாளையங்கள் அமைப்பை வழிநடத்திய பிரதமர்|அரியநாத முதலியார்
282|number|Number of palayams created from former Pandyan territories|72|முன்னாள் பாண்டியப் பகுதிகளில் உருவாக்கப்பட்ட பாளையங்கள் எண்ணிக்கை|72
282|number|Bastions in Viswanatha Nayak's Madurai fort|72|விசுவநாத நாயக்கின் மதுரை கோட்டையில் இருந்த கொத்தளங்கள்|72
282|period|Period to which Palayakkarar system origins are dated|1530s|பாளையக்காரர் முறையின் தோற்றக் காலம்|1530கள்
282|kingdom|Kingdom where Palayakkarar-like system was believed to exist earlier|Kakatiya kingdom of Warangal|பாளையக்காரர் போன்ற முறை முன்பிருந்ததாகக் கூறப்படும் அரசு|வாரங்கல் காகத்திய அரசு
282|meaning|Literal meaning of Palayakkarar|Holder of a camp and military-tenure estate|பாளையக்காரர் என்ற சொல்லின் நேரடி பொருள்|படை முகாமும் இராணுவ நிலமானியமும் வைத்தவர்
282|office|Police-fee collector before palayam system|Servaikarar|பாளைய முறை முன் காவல் கட்டணம் வசூலித்தோர்|சேர்வைக்காரர்
282|office|Another police worker before palayam system|Talayari|பாளைய முறை முன் காவல் பணியில் இருந்தோர்|தலையாரி
282|duty|One obligation of a Palayakkarar|Pay fixed annual tribute|பாளையக்காரரின் ஒரு கடமை|நிர்ணயிக்கப்பட்ட ஆண்டு கப்பம் செலுத்துதல்
282|duty|Alternative military obligation of Palayakkarar|Supply troops to the king|பாளையக்காரரின் மாற்று இராணுவ கடமை|மன்னருக்கு படைகள் வழங்குதல்
282|duty|Local administrative duty of Palayakkarar|Maintain order and peace|பாளையக்காரரின் உள்ளூர் நிர்வாகக் கடமை|அமைதி மற்றும் ஒழுங்கை பராமரித்தல்
283|power|Judicial authority of Palayakkarars|Civil and criminal justice|பாளையக்காரர்களின் நீதித்துறை அதிகாரம்|குடிமை மற்றும் குற்றவியல் நீதி
283|classification|Two topographical groups of palayams|Western and eastern palayams|பாளையங்களின் நிலவியல் வகைப்பாடு|மேற்கு மற்றும் கிழக்கு பாளையங்கள்
283|group|Chieftains dominating western Tirunelveli palayams|Maravars|திருநெல்வேலியின் மேற்கு பாளையங்களில் ஆதிக்கம் செலுத்தியோர்|மறவர்கள்
283|group|Migrants associated with eastern black-soil palayams|Telugu migrants|கிழக்கு கரிசல் நிலப் பாளையங்களுடன் தொடர்புடைய குடியேறிகள்|தெலுங்கு குடியேறிகள்
283|ruler|Authority that pledged villages and transferred arrears collection to Company|Nawab of Arcot|கிராமங்களை அடமானம் வைத்து கம்பெனிக்கு வரி பாக்கி வசூல் ஒப்படைத்தவர்|ஆர்க்காடு நவாப்
283|person|Commander and revenue collector remembered as Khan Sahib|Yusuf Khan|கான் சாஹிப் என நினைவுகூரப்படும் படைத்தளபதி மற்றும் வரிவசூலிப்பாளர்|யூசுப் கான்
283|number|Europeans ordered into Madurai and Tirunelveli in 1755|500|1755இல் மதுரை-திருநெல்வேலிக்கு அனுப்பப்பட்ட ஐரோப்பியர்கள்|500
283|number|Sepoys ordered with Europeans in 1755|200|1755இல் ஐரோப்பியர்களுடன் அனுப்பப்பட்ட சிப்பாய்கள்|200
283|person|Arcot Nawab's elder brother appointed representative|Mahfuz Khan|ஆர்க்காடு நவாபின் அண்ணனாக பிரதிநிதி நியமிக்கப்பட்டவர்|மஹ்ஃபூஸ் கான்
283|person|British officer who marched with Mahfuz Khan|Colonel Heron|மஹ்ஃபூஸ் கானுடன் நகர்ந்த ஆங்கில அதிகாரி|கர்னல் ஹெரான்
283|place|Palayam of Kattabomman targeted by expedition|Panchalamkurichi|கட்டபொம்மனை அடக்க அனுப்பப்பட்ட படையின் இலக்கு பாளையம்|பாஞ்சாலங்குறிச்சி
283|place|Fort of Puli Thevar attacked by Colonel Heron|Nerkattumseval|கர்னல் ஹெரான் தாக்க முயன்ற புலித்தேவரின் கோட்டை|நெற்கட்டும்செவல்
283|person|Western palayakkarar who led early resistance|Puli Thevar|மேற்கு பாளையக்காரர்களின் தொடக்க எதிர்ப்பை வழிநடத்தியவர்|புலித்தேவர்
283|cause|Why Heron's attack on Nerkattumseval was abandoned|Lack of cannon, supplies and pay|நெற்கட்டும்செவல் தாக்குதல் கைவிடப்பட்ட காரணம்|பீரங்கி, வழங்கல் மற்றும் ஊதிய பற்றாக்குறை
283|birthname|Birth name of Yusuf Khan|Maruthanayakam|யூசுப் கானின் பிறப்புப் பெயர்|மருதநாயகம்
283|region|Native district of Yusuf Khan|Ramanathapuram|யூசுப் கானின் சொந்த மாவட்டம்|ராமநாதபுரம்
283|place|Place where Yusuf Khan embraced Islam|Pondicherry|யூசுப் கான் இஸ்லாம் தழுவிய இடம்|புதுச்சேரி
283|date|Year Yusuf Khan joined Company sepoys under Clive|1752|கிளைவின் கீழ் யூசுப் கான் கம்பெனி சிப்பாய்களில் சேர்ந்த ஆண்டு|1752
283|period|Years Yusuf Khan participated in siege of Tiruchirappalli|1752–1754|யூசுப் கான் திருச்சிராப்பள்ளி முற்றுகையில் பங்கேற்ற காலம்|1752–1754
283|period|Years Yusuf Khan governed Madurai and Tirunelveli|1756–1761|யூசுப் கான் மதுரை-திருநெல்வேலி நிர்வகித்த காலம்|1756–1761
283|person|Mysore ruler defeated by Yusuf Khan|Haider Ali|யூசுப் கான் தோற்கடித்த மைசூர் ஆட்சியாளர்|ஹைதர் அலி
283|place|Place captured by Yusuf Khan after defeating Haider|Solavandan|ஹைதரைத் தோற்கடித்து யூசுப் கான் கைப்பற்றிய இடம்|சோழவந்தான்
283|period|Lally's siege of Madras during which Yusuf Khan served English|1758–1759|லாலியின் மதராஸ் முற்றுகை காலம்|1758–1759
283|industry|Industry Yusuf Khan encouraged in Madurai|Weaving industry|மதுரையில் யூசுப் கான் ஊக்குவித்த தொழில்|நெசவுத் தொழில்
283|cause|Reason Yusuf Khan rebelled|English ordered him to serve Nawab of Arcot|யூசுப் கான் கிளர்ந்த காரணம்|ஆர்க்காடு நவாபுக்கு சேவை செய்ய ஆங்கிலேயர் உத்தரவிட்டனர்
283|person|One Pathan officer supporting Tamil palayakkarars|Mianah|தமிழ் பாளையக்காரர்களை ஆதரித்த பாதான் அதிகாரி|மியானா
283|person|One Pathan officer supporting Tamil palayakkarars|Mudimiah|தமிழ் பாளையக்காரர்களை ஆதரித்த பாதான் அதிகாரி|முதிமியா
283|person|One Pathan officer supporting Tamil palayakkarars|Nabikhan Kattak|தமிழ் பாளையக்காரர்களை ஆதரித்த பாதான் அதிகாரி|நபிகான் கட்டக்
283|ruler|Nawab opposed by Pathan officers and Tamil palayakkarars|Mohamed Ali|பாதான் அதிகாரிகளும் தமிழ் பாளையக்காரர்களும் எதிர்த்த நவாப்|முகமது அலி
283|palayam|One palayam in Puli Thevar's confederacy|Uthumalai|புலித்தேவர் கூட்டமைப்பில் சேர்ந்த பாளையம்|ஊத்துமலை
283|palayam|One palayam in Puli Thevar's confederacy|Surandai|புலித்தேவர் கூட்டமைப்பில் சேர்ந்த பாளையம்|சுரண்டை
283|palayam|One palayam in Puli Thevar's confederacy|Singampatti|புலித்தேவர் கூட்டமைப்பில் சேர்ந்த பாளையம்|சிங்கம்பட்டி
283|palayam|One palayam in Puli Thevar's confederacy|Seithur|புலித்தேவர் கூட்டமைப்பில் சேர்ந்த பாளையம்|சேத்தூர்
283|palayam|One palayam in Puli Thevar's confederacy|Kollamkondan|புலித்தேவர் கூட்டமைப்பில் சேர்ந்த பாளையம்|கொல்லங்கொண்டான்
283|palayam|One palayam in Puli Thevar's confederacy|Wadakarai|புலித்தேவர் கூட்டமைப்பில் சேர்ந்த பாளையம்|வடகரை
283|ruler|Ruler won over by Puli Thevar with promise of restoring Kalakkadu|Ruler of Travancore|களக்காட்டை மீட்பதாகக் கூறி புலித்தேவர் இணைத்த ஆட்சியாளர்|திருவிதாங்கூர் ஆட்சியாளர்
283|number|Company sepoys with Mahfuz Khan before Nawab reinforcement|1000|மஹ்ஃபூஸ் கானிடம் இருந்த கம்பெனி சிப்பாய்கள்|1000
283|number|Additional sepoys sent by Nawab to Mahfuz Khan|600|நவாப் மஹ்ஃபூஸ் கானுக்கு அனுப்பிய கூடுதல் சிப்பாய்கள்|600
284|number|Travancore soldiers who joined Puli Thevar near Kalakadu|2000|களக்காடு அருகே புலித்தேவருடன் சேர்ந்த திருவிதாங்கூர் வீரர்கள்|2000
284|battle|Battle in which Mahfuz Khan's troops were defeated|Battle of Kalakadu|மஹ்ஃபூஸ் கான் படை தோற்கடிக்கப்பட்ட போர்|களக்காடு போர்
284|period|Puli Thevar-led Tirunelveli rebellion period|1756–1763|புலித்தேவர் தலைமையிலான திருநெல்வேலி கிளர்ச்சி காலம்|1756–1763
284|date|Month and year big guns arrived for Yusuf Khan|September 1760|யூசுப் கானுக்கு பெரிய பீரங்கிகள் வந்த மாதம் மற்றும் ஆண்டு|செப்டம்பர் 1760
284|duration|Duration of Yusuf Khan's bombardment of Nerkattumseval|About two months|யூசுப் கான் நெற்கட்டும்செவலைத் தாக்கிய காலம்|சுமார் இரண்டு மாதங்கள்
284|date|Date Puli Thevar's three major forts fell to Yusuf Khan|16 May 1761|புலித்தேவரின் மூன்று முக்கிய கோட்டைகள் யூசுப் கானிடம் சென்ற தேதி|16 மே 1761
284|fort|One major fort of Puli Thevar captured by Yusuf Khan|Nerkattumseval|யூசுப் கான் கைப்பற்றிய புலித்தேவரின் முக்கிய கோட்டை|நெற்கட்டும்செவல்
284|fort|One major fort of Puli Thevar captured by Yusuf Khan|Vasudevanallur|யூசுப் கான் கைப்பற்றிய புலித்தேவரின் முக்கிய கோட்டை|வாசுதேவநல்லூர்
284|fort|One major fort of Puli Thevar captured by Yusuf Khan|Panayur|யூசுப் கான் கைப்பற்றிய புலித்தேவரின் முக்கிய கோட்டை|பனையூர்
284|date|Year Yusuf Khan was hanged for treachery|1764|யூசுப் கான் துரோகம் குற்றச்சாட்டில் தூக்கிலிடப்பட்ட ஆண்டு|1764
284|person|British officer who captured Nerkattumseval in 1767|Captain Campbell|1767இல் நெற்கட்டும்செவலை கைப்பற்றிய ஆங்கில அதிகாரி|கேப்டன் கேம்ப்பெல்
284|date|Year Campbell captured Nerkattumseval|1767|கேம்ப்பெல் நெற்கட்டும்செவலை கைப்பற்றிய ஆண்டு|1767

284|person|Father of Velu Nachiyar|Chellamuthu Sethupathy|வேலு நாச்சியாரின் தந்தை|செல்லமுத்து சேதுபதி
284|state|Kingdom ruled by Velu Nachiyar's father|Ramanathapuram|வேலு நாச்சியாரின் தந்தை ஆட்சி செய்த அரசு|ராமநாதபுரம்
284|person|Husband of Velu Nachiyar|Muthu Vadugar Periyaudayar|வேலு நாச்சியாரின் கணவர்|முத்து வடுகர் பெரியுடையார்
284|state|Kingdom ruled by Velu Nachiyar's husband|Sivagangai|வேலு நாச்சியாரின் கணவர் ஆட்சி செய்த அரசு|சிவகங்கை
284|person|Daughter of Velu Nachiyar|Vellachi Nachiar|வேலு நாச்சியாரின் மகள்|வெள்ளச்சி நாச்சியார்
284|place|Place near Dindigul where Velu Nachiyar lived under Haider's protection|Virupachi|ஹைதரின் பாதுகாப்பில் வேலு நாச்சியார் வாழ்ந்த இடம்|விருப்பாட்சி
284|duration|Years Velu Nachiyar lived under Haider Ali's protection|Eight years|ஹைதர் அலியின் பாதுகாப்பில் வேலு நாச்சியார் இருந்த காலம்|எட்டு ஆண்டுகள்
284|ally|Local ally of Velu Nachiyar|Gopala Nayaker|வேலு நாச்சியாரின் உள்ளூர் கூட்டாளர்|கோபால நாயக்கர்
284|ally|Mysore ally of Velu Nachiyar|Haider Ali|வேலு நாச்சியாரின் மைசூர் கூட்டாளர்|ஹைதர் அலி
284|date|Year Velu Nachiyar fought and defeated British|1780|வேலு நாச்சியார் ஆங்கிலேயரை எதிர்த்து வென்ற ஆண்டு|1780
284|person|Follower who self-immolated to destroy British ammunition|Kuyili|ஆங்கிலேய வெடிமருந்துக் கிடங்கை அழிக்க தன்னைத்தானே தீயிட்ட வேலு நாச்சியாரின் வீராங்கனை|குயிலி
284|person|Adopted daughter-agent who detonated British arsenal|Udaiyaal|ஆங்கிலேய ஆயுதக்கிடங்கை வெடிக்கச் செய்த தத்தெடுக்கப்பட்ட மகள் முகவர்|உடையாள்
284|force|Special force formed by Velu Nachiyar|Women's army|வேலு நாச்சியார் அமைத்த சிறப்பு படை|பெண்கள் படை
284|result|Kingdom recaptured by Velu Nachiyar|Sivagangai|வேலு நாச்சியார் மீட்ட அரசு|சிவகங்கை
284|support|Who helped Velu Nachiyar to be crowned again|Marudu brothers|வேலு நாச்சியார் மீண்டும் முடிசூட உதவியோர்|மருது சகோதரர்கள்
284|person|Adviser appointed by Velu Nachiyar|Chinna Marudu|வேலு நாச்சியார் நியமித்த ஆலோசகர்|சின்ன மருது
284|person|Commander appointed by Velu Nachiyar|Periya Marudu|வேலு நாச்சியார் நியமித்த தளபதி|பெரிய மருது
284|date|Year English invaded Sivagangai again|1783|ஆங்கிலேயர் மீண்டும் சிவகங்கை மீது படையெடுத்த ஆண்டு|1783
284|date|Year Vellachi Nachiyar's succession arrangement mentioned|1790|வெள்ளச்சி நாச்சியாரின் வாரிசுத் தொடர்பு குறிப்பிடப்பட்ட ஆண்டு|1790
284|date|Year Velu Nachiyar died|1796|வேலு நாச்சியார் இறந்த ஆண்டு|1796

285|person|Palayakkarar of Panchalamkurichi who resisted British|Veera Pandiya Kattabomman|பாஞ்சாலங்குறிச்சியின் ஆங்கில எதிர்ப்பு பாளையக்காரர்|வீரபாண்டிய கட்டபொம்மன்
285|date|Year Veera Pandiya Kattabomman was born|1760|வீரபாண்டிய கட்டபொம்மன் பிறந்த ஆண்டு|1760
285|title|Nature of name Kattabomman Nayak|Family title|கட்டபொம்மன் நாயக் என்ற பெயரின் தன்மை|குடும்பப் பட்டம்
285|person|Kattabomman's grandfather in Colonel Heron's time|Jagaveera Kattabomman|கர்னல் ஹெரான் காலத்தில் இருந்த கட்டபொம்மனின் தாத்தா|ஜகவீர கட்டபொம்மன்
285|date|Month and year tribute from Panchalamkurichi fell into arrears|September 1798|பாஞ்சாலங்குறிச்சி கப்பம் பாக்கியான மாதம் மற்றும் ஆண்டு|செப்டம்பர் 1798
285|person|Collector who wrote arrogantly to Kattabomman|W.C. Jackson|கட்டபொம்மனுக்கு கடுமையாக எழுதிய ஆட்சியர்|டபிள்யூ.சி. ஜாக்சன்
285|cause|Environmental reason making tax collection difficult|Severe drought|வரி வசூல் கடினமான இயற்கை காரணம்|கடும் வறட்சி
285|date|Date Jackson summoned Kattabomman to meet at Ramanathapuram|18 August 1798|கட்டபொம்மனை ராமநாதபுரம் சந்திக்க ஜாக்சன் அழைத்த தேதி|18 ஆகஸ்ட் 1798
285|duration|Days Kattabomman followed Jackson before interview|23 days|ஜாக்சனை சந்திக்க கட்டபொம்மன் பின்தொடர்ந்த நாட்கள்|23 நாட்கள்
285|distance|Distance Kattabomman followed Jackson|Over 400 miles|ஜாக்சனை கட்டபொம்மன் பின்தொடர்ந்த தூரம்|400 மைலுக்கு மேல்
285|date|Date Kattabomman reached Ramanathapuram|19 September 1798|கட்டபொம்மன் ராமநாதபுரம் சென்ற தேதி|19 செப்டம்பர் 1798
285|arrears|Balance tribute Jackson found due|1080 pagodas|ஜாக்சன் கணக்கில் மீதமிருந்த கப்பம்|1080 பகோடா
285|person|Minister of Kattabomman detained at Ramanathapuram|Sivasubramania Pillai|ராமநாதபுரத்தில் பிடிக்கப்பட்ட கட்டபொம்மனின் அமைச்சர்|சிவசுப்பிரமணிய பிள்ளை
285|person|British officer killed in clash at Ramanathapuram fort gate|Lieutenant Clarke|ராமநாதபுரம் கோட்டை வாயில் மோதலில் கொல்லப்பட்ட ஆங்கில அதிகாரி|லெப்டினன்ட் கிளார்க்
285|currency|Dominant currency when Europeans arrived|Pagoda|ஐரோப்பியர்கள் வந்த காலத்தின் முக்கிய நாணயம்|பகோடா
285|origin|Historical origin of Pagoda coin|Vijayanagara|பகோடா நாணயத்தின் வரலாற்று மூலாதாரம்|விஜயநகரம்
285|name|Tamil name for Pagoda coin|Varagan|பகோடா நாணயத்தின் தமிழ் பெயர்|வராகன்
285|value|Tipu-period Mysore value of one pagoda|Three and a half rupees|திப்பு கால மைசூரில் ஒரு பகோடாவின் மதிப்பு|மூன்றரை ரூபாய்
290|person|Governor who promised fair inquiry if Kattabomman surrendered|Edward Clive|கட்டபொம்மன் சரணடைந்தால் நியாய விசாரணை என உறுதியளித்த ஆளுநர்|எட்வர்ட் கிளைவ்
290|result|Committee finding on Kattabomman rebellion charge|Acquitted him|கட்டபொம்மன் மீது கிளர்ச்சி குற்றச்சாட்டில் குழுவின் முடிவு|குற்றமற்றவர் என விடுவித்தது
290|person|Collector appointed in place of dismissed Jackson|S.R. Lushington|பதவி நீக்கப்பட்ட ஜாக்சனுக்கு பதிலாக நியமிக்கப்பட்ட ஆட்சியர்|எஸ்.ஆர். லஷிங்டன்
290|person|Sivagangai leader organising anti-British confederacy|Marudu Pandiyan|ஆங்கில எதிர்ப்பு கூட்டமைப்பை அமைத்த சிவகங்கைத் தலைவர்|மருது பாண்டியன்
290|person|Dindigul ally in confederacy|Gopala Nayak|கூட்டமைப்பின் திண்டுக்கல் கூட்டாளர்|கோபால நாயக்
290|person|Anamalai ally in confederacy|Yadul Nayak|கூட்டமைப்பின் ஆனைமலை கூட்டாளர்|யாதுல் நாயக்
290|fort|Strategically strong fort at foot of Western Ghats|Sivagiri fort|மேற்கு தொடர்ச்சி மலை அடிவாரத்தில் தந்திர ரீதியாக வலுவான கோட்டை|சிவகிரி கோட்டை
290|person|Commander leading armed column westwards|Dalawai Kumaraswami Nayak|மேற்கே சென்ற ஆயுதப்படையை வழிநடத்தியவர்|தளவாய் குமாரசாமி நாயக்
290|date|Month and year Wellesley ordered forces to Tirunelveli|May 1799|திருநெல்வேலிக்கு படைகள் செல்ல வெல்லெஸ்லி உத்தரவிட்ட மாதம் மற்றும் ஆண்டு|மே 1799
290|person|British officer given extensive powers in expedition|Major Bannerman|படை நடவடிக்கையில் விரிவான அதிகாரம் பெற்ற ஆங்கில அதிகாரி|மேஜர் பானர்மேன்
290|date|Date Kattabomman proceeded to Sivaganga with 500 men|1 June 1799|500 பேருடன் கட்டபொம்மன் சிவகங்கை சென்ற தேதி|1 ஜூன் 1799
290|number|Men accompanying Kattabomman to Sivaganga|500|கட்டபொம்மனுடன் சிவகங்கை சென்றோர் எண்ணிக்கை|500
290|place|Place where Kattabomman deliberated with Marudu|Palayanur|மருதுவுடன் கட்டபொம்மன் ஆலோசித்த இடம்|பழையனூர்
290|number|Armed Sivaganga men joining Kattabomman on return|500|திரும்பும்போது கட்டபொம்மனுடன் சேர்ந்த சிவகங்கை ஆயுத வீரர்கள்|500
290|palayam|One palayam in Marudu-supported league|Nagalapuram|மருது ஆதரித்த கூட்டணியில் இருந்த பாளையம்|நாகலாபுரம்
290|palayam|One palayam in Marudu-supported league|Mannarkottai|மருது ஆதரித்த கூட்டணியில் இருந்த பாளையம்|மன்னார்கோட்டை
290|palayam|One palayam in Marudu-supported league|Kolarpatti|மருது ஆதரித்த கூட்டணியில் இருந்த பாளையம்|கோலார்பட்டி
290|palayam|One palayam Kattabomman persuaded to join league|Satur|கட்டபொம்மன் கூட்டணியில் சேர்த்த பாளையம்|சாத்தூர்
290|palayam|One palayam Kattabomman persuaded to join league|Yezhayirampannai|கட்டபொம்மன் கூட்டணியில் சேர்த்த பாளையம்|ஏழாயிரம்பண்ணை
290|palayam|One palayam Kattabomman persuaded to join league|Kadalgudi|கட்டபொம்மன் கூட்டணியில் சேர்த்த பாளையம்|கடல்குடி
290|palayam|One palayam Kattabomman persuaded to join league|Kulathoor|கட்டபொம்மன் கூட்டணியில் சேர்த்த பாளையம்|குளத்தூர்
290|date|Date Bannerman issued ultimatum to Kattabomman|1 September 1799|பானர்மேன் கட்டபொம்மனுக்கு இறுதி எச்சரிக்கை விடுத்த தேதி|1 செப்டம்பர் 1799
290|place|Place where Bannerman ordered Kattabomman to meet him|Palayamkottai|பானர்மேன் கட்டபொம்மனை சந்திக்க அழைத்த இடம்|பாளையங்கோட்டை
290|date|Date Company army reached Panchalamkurichi|5 September 1799|கம்பெனி படை பாஞ்சாலங்குறிச்சி வந்த தேதி|5 செப்டம்பர் 1799
290|dimension|Length of Kattabomman's fort|500 feet|கட்டபொம்மன் கோட்டையின் நீளம்|500 அடி
290|dimension|Breadth of Kattabomman's fort|300 feet|கட்டபொம்மன் கோட்டையின் அகலம்|300 அடி
290|material|Material of Kattabomman's fort|Mud|கட்டபொம்மன் கோட்டை கட்டப்பட்ட பொருள்|மண்
290|date|Date reinforcements arrived from Palayamkottai|16 September 1799|பாளையங்கோட்டையிலிருந்து கூடுதல் படைகள் வந்த தேதி|16 செப்டம்பர் 1799
290|place|Place to which Kattabomman's garrison evacuated|Kadalgudi|கட்டபொம்மன் படை வெளியேறிச் சென்ற இடம்|கடல்குடி
290|place|Place where Sivasubramania Pillai was captured|Kalarpatti|சிவசுப்பிரமணிய பிள்ளை பிடிக்கப்பட்ட இடம்|களர்பட்டி
290|person|Pudukottai Raja who captured Kattabomman|Vijaya Ragunatha Tondaiman|கட்டபொம்மனை பிடித்த புதுக்கோட்டை ராஜா|விஜய ரகுநாத தொண்டைமான்
290|place|Jungle where Kattabomman was captured|Kalapore|கட்டபொம்மன் பிடிக்கப்பட்ட காடு|கலாபூர்
291|date|Date Kattabomman was tried and hanged|16 October 1799|கட்டபொம்மன் விசாரிக்கப்பட்டு தூக்கிலிடப்பட்ட தேதி|16 அக்டோபர் 1799
291|place|Place where Kattabomman was tried|Kayatar|கட்டபொம்மன் விசாரிக்கப்பட்ட இடம்|கயத்தாறு
291|fate|Punishment imposed on Kattabomman|Hanged to death|கட்டபொம்மனுக்கு வழங்கப்பட்ட தண்டனை|தூக்கு தண்டனை

291|treaty|Treaty authorizing Company to collect Stalam Kaval and Desakaval|Treaty of 1772|ஸ்தல காவல் மற்றும் தேச காவல் வசூலிக்க கம்பெனிக்கு அதிகாரம் அளித்த உடன்படிக்கை|1772 உடன்படிக்கை
291|charge|One levy Company was authorised to collect|Stalam Kaval|கம்பெனி வசூலிக்க அதிகாரம் பெற்ற காவல் கட்டணம்|ஸ்தல காவல்
291|charge|Another levy Company was authorised to collect|Desakaval|கம்பெனி வசூலிக்க அதிகாரம் பெற்ற மற்றொரு காவல் கட்டணம்|தேசகாவல்
291|person|Marudu brother administering Sivagangai|Vella Marudu|சிவகங்கை நிர்வாகத்தை ஏற்ற மருது சகோதரர்|வெள்ளை மருது
291|person|Another Marudu brother administering Sivagangai|Chinna Marudu|சிவகங்கை நிர்வாகத்தை ஏற்ற மற்றொரு மருது சகோதரர்|சின்ன மருது
291|place|Temple serving as rebel rallying point|Kalayarkoil|கிளர்ச்சியாளர்களின் திரளும் மையமாக இருந்த கோவில்|காளையார்கோவில்
291|person|Brother of Kattabomman sheltered by Chinna Marudu|Umathurai|சின்ன மருதுவால் பாதுகாக்கப்பட்ட கட்டபொம்மனின் சகோதரர்|ஊமைத்துரை
291|place|Capital of Chinna Marudu|Siruvayal|சின்ன மருதுவின் தலைநகர்|சிறுவயல்
291|person|Setupati restored to Ramanathapuram by Nawab|Muthuramalinga Thevar|நவாபால் ராமநாதபுரம் சேதுபதியாக மீள அமர்த்தப்பட்டவர்|முத்துராமலிங்கத் தேவர்
291|person|Ruler proclaimed by rebels in Ramanathapuram|Muthu Karuppa Thevar|ராமநாதபுரத்தில் கிளர்ச்சியாளர்கள் அறிவித்த ஆட்சியாளர்|முத்து கருப்பத் தேவர்
291|date|Month when Umathurai captured Palayanad|July|ஊமைத்துரை பழையநாட்டை கைப்பற்றிய மாதம்|ஜூலை
291|date|Year Sivagangai and Ramanathapuram forces joined|1801|சிவகங்கை மற்றும் ராமநாதபுரம் படைகள் இணைந்த ஆண்டு|1801
291|person|Son of Chinna Marudu commanding combined forces|Shevatha Thambi|இணைந்த படைகளை வழிநடத்திய சின்ன மருதுவின் மகன்|செவத்த தம்பி
291|region|Area toward which Shevatha Thambi marched|Thanjavur coast|செவத்த தம்பி படை சென்ற பகுதி|தஞ்சாவூர் கடற்கரை
291|group|Local group that joined Shevatha Thambi|Distressed peasants of Thanjavur|செவத்த தம்பியுடன் சேர்ந்த உள்ளூர் மக்கள்|தஞ்சாவூர் துயருற்ற விவசாயிகள்
291|person|British resident of Thanjavur who defeated Shevatha Thambi|Captain William Blackburne|செவத்த தம்பியை தோற்கடித்த தஞ்சாவூர் பிரிட்டிஷ் ரெசிடெண்ட்|கேப்டன் வில்லியம் பிளாக்பர்ன்
291|place|Place near which Shevatha Thambi was defeated|Mangudi|செவத்த தம்பி தோற்கடிக்கப்பட்ட இடம்|மாங்குடி
291|person|Thanjavur Raja who supported British|Serfoji|ஆங்கிலேயரை உறுதியாக ஆதரித்த தஞ்சாவூர் ராஜா|சரபோஜி

291|event|Rebellion formally identified for 1801|South Indian Rebellion|1801இல் குறிப்பிடப்படும் முக்கிய கிளர்ச்சி|தென்னிந்தியக் கிளர்ச்சி
291|cause|British victories that freed forces for Ramanathapuram and Sivagangai|Victories over Tipu and Kattabomman|ராமநாதபுரம்-சிவகங்கை மீது படைகளை திருப்ப உதவிய வெற்றிகள்|திப்பு மற்றும் கட்டபொம்மன் மீதான வெற்றிகள்
291|person|Pudukottai ruler already on Company side|Thondaiman|கம்பெனி பக்கம் இருந்த புதுக்கோட்டை ஆட்சியாளர்|தொண்டைமான்
291|person|Sivagangai claimant recognised by Company|Padmattur Woya Thevar|கம்பெனி சட்டப்பூர்வ சிவகங்கை ஆட்சியாளராக அங்கீகரித்தவர்|படமாத்தூர் வொய்யா தேவர்
291|strategy|British method that split royalist group|Recognition of rival claimant|அரச ஆதரவு குழுவை பிளந்த ஆங்கிலேய நடைமுறை|போட்டி வாரிசை சட்டப்பூர்வ ஆட்சியாளராக அங்கீகரித்தல்
291|person|Commander of strong Company detachment in May 1801|P.A. Agnew|மே 1801 கம்பெனி படையணித் தளபதி|பி.ஏ. அக்னியூ
291|place|One route town through which Agnew marched|Manamadurai|அக்னியூ படை சென்ற வழிப் பகுதி|மானாமதுரை
291|place|One route town through which Agnew marched|Partibanur|அக்னியூ படை சென்ற வழிப் பகுதி|பார்த்திபனூர்
291|place|Rebel stronghold occupied by Company forces|Paramakudi|கம்பெனி கைப்பற்றிய கிளர்ச்சியாளர் கோட்டை பகுதி|பரமக்குடி
292|place|Hills where Marudu brothers were captured|Singampunary hills|மருது சகோதரர்கள் பிடிக்கப்பட்ட மலைப்பகுதி|சிங்கம்புணரி மலைகள்
292|place|Place where Shevathiah was captured|Batlagundu|செவத்தியா பிடிக்கப்பட்ட இடம்|வத்தலகுண்டு
292|person|Son of Vellai Marudu captured near Madurai|Doraiswamy|மதுரை அருகே பிடிக்கப்பட்ட வெள்ளை மருதுவின் மகன்|துரைசாமி
292|date|Date Chinna and Vellai Marudu were executed|24 October 1801|சின்ன மற்றும் வெள்ளை மருது தூக்கிலிடப்பட்ட தேதி|24 அக்டோபர் 1801
292|place|Fort where Marudu brothers were executed|Tiruppatthur fort|மருது சகோதரர்கள் தூக்கிலிடப்பட்ட கோட்டை|திருப்பத்தூர் கோட்டை
292|date|Date Umathurai and Shevathiah were beheaded|16 November 1801|ஊமைத்துரை மற்றும் செவத்தியா தலை வெட்டப்பட்ட தேதி|16 நவம்பர் 1801
292|place|Place where Umathurai and Shevathiah were executed|Panchalamkurichi|ஊமைத்துரை மற்றும் செவத்தியா தூக்கிலிடப்பட்ட இடம்|பாஞ்சாலங்குறிச்சி
292|number|Rebels banished to Penang|73|பினாங்கிற்கு நாடுகடத்தப்பட்ட கிளர்ச்சியாளர்கள்|73
292|date|Month and year rebels were banished to Penang|April 1802|கிளர்ச்சியாளர்கள் பினாங்கிற்கு நாடுகடத்தப்பட்ட காலம்|ஏப்ரல் 1802
292|place|Place of banishment of 73 rebels|Penang in Malaya|73 கிளர்ச்சியாளர்கள் நாடுகடத்தப்பட்ட இடம்|மலாயாவின் பினாங்கு

292|region|Area comprising Salem, Coimbatore, Karur and Dindigul|Kongu country|சேலம், கோயம்புத்தூர், கரூர், திண்டுக்கல் அடங்கிய பகுதி|கொங்கு நாடு
292|person|Palayakkarar of Kongu who fought Company|Theeran Chinnamalai|கம்பெனியை எதிர்த்த கொங்கு பாளையக்காரர்|தீரன் சின்னமலை
292|training|Powers that trained Theeran Chinnamalai|French and Tipu|தீரன் சின்னமலையைப் பயிற்றுவித்த சக்திகள்|பிரெஞ்சுக்காரரும் திப்புவும்
292|target|Company fort Chinnamalai planned to attack in 1800|Coimbatore fort|1800இல் சின்னமலை தாக்கத் திட்டமிட்ட கம்பெனி கோட்டை|கோயம்புத்தூர் கோட்டை
292|ally|Sivagangai allies sought by Chinnamalai|Marudu brothers|சின்னமலை உதவி நாடிய சிவகங்கை கூட்டாளிகள்|மருது சகோதரர்கள்
292|ally|Virupatchi ally of Chinnamalai|Gopal Nayak|சின்னமலையின் விருப்பாட்சி கூட்டாளர்|கோபால நாயக்
292|ally|Paramathi Velur ally of Chinnamalai|Appachi Gounder|சின்னமலையின் பரமத்தி வேலூர் கூட்டாளர்|அப்பாச்சி கவுண்டர்
292|ally|Attur Salem ally of Chinnamalai|Joni Jon Kahan|சின்னமலையின் ஆத்தூர்-சேலம் கூட்டாளர்|ஜோனி ஜான் கான்
292|ally|Perundurai ally of Chinnamalai|Kumaral Vellai|சின்னமலையின் பெருந்துறை கூட்டாளர்|குமரல் வெள்ளை
292|ally|Erode ally of Chinnamalai|Varanavasi|சின்னமலையின் ஈரோடு கூட்டாளர்|வாரணவாசி
292|number|People executed after failed Coimbatore fort plan|49|கோயம்புத்தூர் கோட்டைத் திட்டத் தோல்விக்குப் பின் தூக்கிலிடப்பட்டோர்|49
292|battle|Important Chinnamalai battle of 1801|Battle on Cauvery banks|1801இல் சின்னமலை நடத்திய முக்கியப் போர்|காவிரி கரைப் போர்
292|battle|Important Chinnamalai battle of 1802|Battle of Odanilai|1802இல் சின்னமலை நடத்திய முக்கியப் போர்|ஓடாநிலைப் போர்
292|battle|Important Chinnamalai battle of 1804|Battle of Arachalur|1804இல் சின்னமலை நடத்திய முக்கியப் போர்|அறச்சலூர் போர்
292|date|Date up to which Chinnamalai continued fighting before execution|31 July 1805|சின்னமலை போராடிய கடைசி தேதி|31 ஜூலை 1805
292|betrayal|Person identified as betraying Chinnamalai|His cook Chinnamalai|சின்னமலையை துரோகம் செய்தவர்|அவரது சமையல்காரர் சின்னமலை
292|place|Fort where Theeran Chinnamalai was hanged|Sangagiri fort|தீரன் சின்னமலை தூக்கிலிடப்பட்ட கோட்டை|சங்ககிரி கோட்டை

292|event|Revolt described as culmination of southern anti-British attempts|Vellore Revolt of 1806|தென்னிந்திய ஆங்கில எதிர்ப்பு முயற்சிகளின் உச்சமாகக் குறிப்பிடப்பட்ட கிளர்ச்சி|1806 வேலூர் கிளர்ச்சி
292|number|Mysore Sultan loyalists settled around Vellore|At least 3000|வேலூர் நகரிலும் சுற்றுவட்டாரத்திலும் குடியேறிய மைசூர் சுல்தான் ஆதரவாளர்கள்|குறைந்தது 3000
292|place|Meeting ground of rebel forces in south India|Vellore Fort|தென்னிந்திய கிளர்ச்சிப் படைகளின் சந்திப்பு மையம்|வேலூர் கோட்டை
292|cause|One dress regulation imposed on sepoys|Ban on caste and religious forehead marks|சிப்பாய்களுக்கு விதிக்கப்பட்ட உடை/அடையாளத் தடை|சாதி மத நெற்றிக்குறிகள் தடை
292|cause|One grooming regulation imposed on sepoys|Moustaches cut to a set pattern|சிப்பாய்களுக்கு விதிக்கப்பட்ட மீசை ஒழுங்கு|ஒரே வடிவில் மீசை வெட்டுதல்
292|person|Adjutant General who designed new turban|Agnew|புதிய தலைப்பாகையை வடிவமைத்த அட்ஜூடன்ட் ஜெனரல்|அக்னியூ
292|object|Most offensive element of new turban|Leather cockade|புதிய தலைப்பாகையின் மிகவும் வெறுக்கப்பட்ட பகுதி|தோல் காகேட்
292|reason|Why leather cockade offended Muslims|Pig skin was taboo|தோல் காகேட் முஸ்லிம்களை ஏன் புண்படுத்தியது|பன்றித் தோல் தடைப்பட்டதாக இருந்தது
292|reason|Why leather cockade offended upper-caste Hindus|Cow hide was shunned|தோல் காகேட் உயர்சாதி இந்துக்களை ஏன் புண்படுத்தியது|மாட்டுத் தோலைத் தவிர்த்தனர்
292|symbol|Uniform feature viewed as Christian symbol|Cross-shaped front|கிறித்தவச் சின்னமாகக் கருதப்பட்ட உடை மாற்றம்|சிலுவை வடிவ முன்பகுதி
293|date|Month and year first turban refusal incident occurred|May 1806|புதிய தலைப்பாகை மறுப்பு முதல் சம்பவம் நடந்த காலம்|மே 1806
293|unit|Unit whose soldiers first refused new turban|2nd Battalion, 4th Regiment|புதிய தலைப்பாகையை முதலில் மறுத்த படைப்பிரிவு|4ஆம் ரெஜிமெண்டின் 2ஆம் பட்டாலியன்
293|person|Vellore garrison commandant who reported turban refusal|Colonel Fancourt|தலைப்பாகை மறுப்பை ஆளுநரிடம் தெரிவித்த வேலூர் தளபதி|கர்னல் ஃபான்கோர்ட்
293|unit|Unit replacing 2nd Battalion of 4th Regiment|2nd Battalion, 23rd Regiment of Wallajahbad|4ஆம் ரெஜிமெண்ட் 2ஆம் பட்டாலியனை மாற்றிய படைப்பிரிவு|வாலாஜாபாத் 23ஆம் ரெஜிமெண்டின் 2ஆம் பட்டாலியன்
293|number|Privates tried by Court Martial for defiance|21|கோர்ட் மார்ஷலில் விசாரிக்கப்பட்ட சிப்பாய்கள்|21
293|number|Muslim privates among those tried|10|விசாரிக்கப்பட்ட முஸ்லிம் சிப்பாய்கள்|10
293|number|Hindu privates among those tried|11|விசாரிக்கப்பட்ட இந்து சிப்பாய்கள்|11
293|punishment|Lashes awarded to two defiant soldiers|900 lashes each|இரு சிப்பாய்களுக்கு வழங்கப்பட்ட சாட்டையடி தண்டனை|தலா 900 சாட்டையடி
293|person|Governor who underestimated sepoy objection to turban|William Bentinck|சிப்பாய்களின் தலைப்பாகை எதிர்ப்பை குறைத்து மதிப்பிட்ட ஆளுநர்|வில்லியம் பெண்டிங்
293|date|Night on which conspirators prepared inside Vellore Fort|9 July 1806|வேலூர் கோட்டையில் சதியாளர்கள் தயாரான இரவு|9 ஜூலை 1806
293|person|Indian officer later principal accused who did night rounds|Jemadar Sheik Kasim|இரவு கண்காணிப்பை செய்த பின்னர் முக்கிய குற்றஞ்சாட்டப்பட்ட இந்திய அதிகாரி|ஜமாதார் ஷேக் காசிம்
293|person|Tipu prince suspected of key role in revolt|Jamal-ud-din|வேலூர் கிளர்ச்சியில் முக்கிய பங்கு சந்தேகிக்கப்பட்ட திப்புவின் இளவரசர்|ஜமாலுத்தீன்
293|number|Support promised by Jamal-ud-din within eight days|10,000 men|எட்டு நாட்களுக்குள் வரும் என ஜமாலுத்தீன் கூறிய ஆதரவு வீரர்கள்|10,000
293|time|Time Vellore Revolt attack began|2:00 a.m.|வேலூர் கிளர்ச்சி தாக்குதல் தொடங்கிய நேரம்|அதிகாலை 2 மணி
293|date|Date of Vellore Revolt|10 July 1806|வேலூர் கிளர்ச்சி நடந்த தேதி|10 ஜூலை 1806
293|person|Corporal first informed of firing|Corporal Piercy|துப்பாக்கிச்சூடு குறித்து முதலில் தகவல் பெற்ற கார்ப்பரல்|கார்ப்பரல் பியர்சி
293|unit|Regiment that seized magazines in fort|1st Regiment|வெடிமருந்துக் கிடங்கை கைப்பற்றிய ரெஜிமெண்ட்|1ஆம் ரெஜிமெண்ட்
293|number|European officers killed in revolt|13|வேலூர் கிளர்ச்சியில் கொல்லப்பட்ட ஐரோப்பிய அதிகாரிகள்|13
293|number|Privates killed in barracks|82|பாரக்கில் கொல்லப்பட்ட சாதாரண வீரர்கள்|82
293|number|Privates wounded in barracks|91|பாரக்கில் காயமடைந்த வீரர்கள்|91
293|person|Major killed by volley from ramparts|Major Armstrong|கோட்டை மதிலிலிருந்து சுட்டதில் கொல்லப்பட்ட மேஜர்|மேஜர் ஆர்ம்ஸ்ட்ராங்
293|person|Officer who sent message to Arcot|Major Coates|ஆர்க்காட்டுக்கு செய்தி அனுப்பிய அதிகாரி|மேஜர் கோட்ஸ்
293|person|Officer who carried letter to Arcot|Captain Stevenson|ஆர்க்காட்டுக்கு கடிதம் எடுத்துச் சென்ற அதிகாரி|கேப்டன் ஸ்டீவன்சன்
293|distance|Approximate distance from Vellore to Arcot|25 km|வேலூரிலிருந்து ஆர்க்காட்டின் சுமார் தூரம்|25 கி.மீ.
293|time|Time letter reached Arcot|6 a.m.|கடிதம் ஆர்க்காடு சென்ற நேரம்|காலை 6 மணி
293|person|Commander at Arcot who rushed to Vellore|Colonel Gillespie|ஆர்க்காட்டிலிருந்து வேலூருக்கு விரைந்த தளபதி|கர்னல் கில்லெஸ்பி
293|unit|Cavalry unit accompanying Gillespie|19th Dragoons|கில்லெஸ்பியுடன் வந்த குதிரைப்படை|19ஆம் டிரகூன்ஸ்
293|person|Captain commanding squadron with Gillespie|Captain Young|கில்லெஸ்பியுடன் வந்த படைப்பிரிவை வழிநடத்திய கேப்டன்|கேப்டன் யங்
293|unit|Supporting cavalry unit under Lieutenant Woodhouse|7th Cavalry|லெப்டினன்ட் வுட்ஹவுஸ் தலைமையிலான ஆதரவு படை|7ஆம் குதிரைப்படை
294|time|Time Gillespie reached Vellore Fort|9 a.m.|கில்லெஸ்பி வேலூர் கோட்டை வந்த நேரம்|காலை 9 மணி
294|time|Approximate time reinforcement cavalry arrived|10 a.m.|கூடுதல் குதிரைப்படை வந்த சுமார் நேரம்|காலை 10 மணி
294|person|Officer directing galloper guns that blew open gate|Lieutenant Blakiston|கோட்டை வாயிலை பீரங்கியால் உடைத்த நடவடிக்கையை வழிநடத்தியவர்|லெப்டினன்ட் பிளாகிஸ்டன்
294|person|Captain heading cavalry squadron entering fort|Captain Skelton|கோட்டைக்குள் நுழைந்த குதிரைப்படையை வழிநடத்தியவர்|கேப்டன் ஸ்கெல்டன்
294|person|Officer who prevented killing of Tipu's sons|Lt. Colonel Marriott|திப்புவின் மகன்களை கொல்ல முயன்றதைத் தடுத்த அதிகாரி|லெப்டினன்ட் கர்னல் மேரியட்
294|duration|Time said to have taken Gillespie to recover fort|About 15 minutes|கில்லெஸ்பி கோட்டையை மீட்டதாகக் கூறப்படும் நேரம்|சுமார் 15 நிமிடங்கள்
294|person|Temporary commander appointed at Vellore after revolt|Colonel Harcourt|கிளர்ச்சிக்குப் பின் வேலூரின் தற்காலிகத் தளபதியாக நியமிக்கப்பட்டவர்|கர்னல் ஹார்கோர்ட்
294|date|Date Harcourt appointed to temporary command|11 July 1806|ஹார்கோர்ட் தற்காலிகத் தளபதியாக நியமிக்கப்பட்ட தேதி|11 ஜூலை 1806
294|date|Date Harcourt assumed garrison command|13 July 1806|ஹார்கோர்ட் கோட்டை கட்டுப்பாட்டை ஏற்ற தேதி|13 ஜூலை 1806
294|law|Emergency rule imposed at Vellore|Martial law|வேலூரில் விதிக்கப்பட்ட அவசர இராணுவ ஆட்சி|மார்ஷல் லா
294|number|Men believed likely to join rebels if fort held a few days|50,000|கோட்டை சில நாட்கள் கிளர்ச்சியாளர்களிடம் இருந்தால் சேர்வார்கள் எனக் கருதப்பட்டோர்|50,000
294|result|Regulations withdrawn after Vellore Revolt|Obnoxious sepoy dress regulations|வேலூர் கிளர்ச்சிக்குப் பின் திரும்பப் பெறப்பட்ட விதிகள்|சிப்பாய்களின் வெறுக்கப்பட்ட உடை விதிகள்
294|result|Destination ordered for Mysore princes after revolt|Calcutta|கிளர்ச்சிக்குப் பின் மைசூர் இளவரசர்கள் அனுப்பப்பட்ட இடம்|கல்கத்தா
294|body|Body unable to establish complicity of Mysore princes|Commission of Inquiry|மைசூர் இளவரசர்களின் தொடர்பை நிரூபிக்க முடியாத அமைப்பு|விசாரணைக் கமிஷன்
294|official|One Madras authority recalled for mishandling revolt|Governor|வேலூர் கிளர்ச்சியை தவறாக கையாள்ந்ததால் திரும்ப அழைக்கப்பட்ட மதராஸ் அதிகாரி|ஆளுநர்
294|official|Another Madras authority recalled|Commander-in-Chief|திரும்ப அழைக்கப்பட்ட மற்றொரு மதராஸ் அதிகாரி|தலைமைத் தளபதி
294|place|One place where Vellore Revolt had echoes|Hyderabad|வேலூர் கிளர்ச்சியின் தாக்கம் உணரப்பட்ட இடம்|ஹைதராபாத்
294|place|One place where Vellore Revolt had echoes|Wallajahbad|வேலூர் கிளர்ச்சியின் தாக்கம் உணரப்பட்ட இடம்|வாலாஜாபாத்
294|place|One place where Vellore Revolt had echoes|Bangalore|வேலூர் கிளர்ச்சியின் தாக்கம் உணரப்பட்ட இடம்|பெங்களூர்
294|place|One place where Vellore Revolt had echoes|Palayamkottai|வேலூர் கிளர்ச்சியின் தாக்கம் உணரப்பட்ட இடம்|பாளையங்கோட்டை
294|number|Bodies said by Blakistan to be carried out of fort|More than 800|பிளாகிஸ்டன் கணக்கில் கோட்டையிலிருந்து எடுத்துச் செல்லப்பட்ட சடலங்கள்|800க்கு மேல்
294|number|Persons jailed according to W.J. Wilson|378|டபிள்யூ.ஜே. வில்சன் கணக்கில் சிறையில் அடைக்கப்பட்டோர்|378
294|number|Persons implicated but not imprisoned according to Wilson|516|வில்சன் கணக்கில் தொடர்புடையதாகக் கருதப்பட்டும் சிறையில் அடைக்கப்படாதோர்|516
294|date|Date Court Martial punishments were carried out|23 September 1806|கோர்ட் மார்ஷல் தண்டனைகள் நிறைவேற்றப்பட்ட தேதி|23 செப்டம்பர் 1806
294|comparison|Later rebellion foreshadowed by Vellore Revolt|Great Rebellion of 1857|வேலூர் கிளர்ச்சி முன்னறிவித்ததாகக் கூறப்படும் பிற்கால கிளர்ச்சி|1857 பெருங்கிளர்ச்சி

295|cause|Company policies that disrupted rural society|Land tenures and revenue settlements|கிராமிய சமூகத்தை சீர்குலைத்த கம்பெனி கொள்கைகள்|நில உடைமை மற்றும் வருவாய் ஒப்பந்தங்கள்
295|action|Initial peasant response to revenue oppression|Petition to Company government|வரி ஒடுக்குமுறைக்கு விவசாயிகளின் ஆரம்ப பதில்|கம்பெனி அரசுக்கு மனு
295|action|Direct action by peasants after petitions failed|Attack cutchery, loot grain stores, refuse revenue|மனுக்கள் பலிக்காதபின் விவசாயிகளின் நேரடி நடவடிக்கை|கச்சேரியைத் தாக்குதல், தானிய கிடங்குகள் கொள்ளை, வரி மறுப்பு
295|movement|Peasant movement of 1840s and 1850s in Kerala|Malabar rebellion|1840–1850களின் கேரள விவசாய இயக்கம்|மலபார் கிளர்ச்சி
295|group|Community central to Malabar rebellion|Mappillas|மலபார் கிளர்ச்சியின் முக்கிய சமூகத்தினர்|மாப்பிள்ளைகள்
295|origin|Ancestry of Mappillas|Arab traders and Malabar women|மாப்பிள்ளைகளின் வம்ச மூலாதாரம்|அரபு வணிகர்களும் மலபார் பெண்களும்
295|occupation|One occupation of Mappillas|Cultivating tenants|மாப்பிள்ளைகளின் ஒரு வாழ்வாதாரம்|குத்தகை விவசாயிகள்
295|occupation|One occupation of Mappillas|Landless labourers|மாப்பிள்ளைகளின் ஒரு வாழ்வாதாரம்|நிலமற்ற கூலிகள்
295|occupation|One occupation of Mappillas|Petty traders|மாப்பிள்ளைகளின் ஒரு வாழ்வாதாரம்|சிறு வணிகர்கள்
295|occupation|One occupation of Mappillas|Fishermen|மாப்பிள்ளைகளின் ஒரு வாழ்வாதாரம்|மீனவர்கள்
295|date|Year British took over Malabar|1792|ஆங்கிலேயர் மலபாரை கைப்பற்றிய ஆண்டு|1792
295|policy|British land change in Malabar|Individual ownership in land|மலபாரில் ஆங்கிலேயர் கொண்டுவந்த நில மாற்றம்|தனிநபர் நில உரிமை
295|share|Traditional parties sharing net produce equally|Janmi, kanamdar and cultivator|மரபு முறையில் நிகர விளைச்சலை சமமாக பகிர்ந்தோர்|ஜன்மி, கனம் தார், விவசாயி
295|status|British status granted to janmi|Absolute owner of land|ஆங்கிலேயர் ஜன்மிக்கு வழங்கிய நிலை|நிலத்தின் முழு உரிமையாளர்
295|right|New right granted to janmi|Right to evict tenants|ஜன்மிக்கு வழங்கப்பட்ட புதிய உரிமை|குத்தகையாளரை வெளியேற்றும் உரிமை
295|cause|One source of Mappilla peasant poverty|Over-assessment|மாப்பிள்ளை விவசாய வறுமைக்கான காரணம்|மிகை வரி மதிப்பீடு
295|cause|One source of Mappilla peasant poverty|Illegal cesses|மாப்பிள்ளை விவசாய வறுமைக்கான காரணம்|சட்டவிரோத கூடுதல் வரிகள்
295|cause|One source of Mappilla peasant poverty|Pro-landlord judiciary and police|மாப்பிள்ளை விவசாய வறுமைக்கான காரணம்|நில உரிமையாளருக்கு சாதகமான நீதி மற்றும் காவல்
295|place|Site of serious Malabar incident in August 1849|Manjeri|ஆகஸ்ட் 1849 மலபார் கிளர்ச்சி நடந்த இடம்|மஞ்சேரி
295|place|Site of serious Malabar incident in August 1851|Kulathur|ஆகஸ்ட் 1851 மலபார் கிளர்ச்சி நடந்த இடம்|குளத்தூர்
295|place|Site of serious Malabar incident in January 1852|Mattannur|ஜனவரி 1852 மலபார் கிளர்ச்சி நடந்த இடம்|மட்டனூர்
295|date|Year Mappillas rose again after repression|1870|அடக்குமுறைக்குப் பின் மாப்பிள்ளைகள் மீண்டும் எழுந்த ஆண்டு|1870

295|period|Kol Uprising period|1831–1832|கோல் கிளர்ச்சியின் காலம்|1831–1832
295|region|One region inhabited by Kols|Chotanagpur|கோல்கள் வாழ்ந்த பகுதி|சோட்டாநாக்பூர்
295|region|Another region inhabited by Kols|Singbhum|கோல்கள் வாழ்ந்த மற்றொரு பகுதி|சிங்பூம்
295|cause|Immediate cause of Kol uprising|Leasing villages to non-tribals|கோல் கிளர்ச்சியின் உடனடி காரணம்|கிராமங்களை பழங்குடியல்லாதவர்களுக்கு குத்தகைக்கு விடுதல்
295|group|Kols that took initiative against thikadars|Sonepur and Tamar Kols|திக்காடர்களுக்கு எதிராக முதலில் எழுந்த கோல்கள்|சோன்பூர் மற்றும் தமர் கோல்கள்
295|term|Meaning of thikadars in this section|Tax collectors|இப்பகுதியில் திக்காடர்கள் என்பதன் பொருள்|வரி வசூலிப்போர்
295|method|Chief modes of Kol protest|Plunder and arson|கோல் போராட்டத்தின் முக்கிய முறைகள்|கொள்ளையிடலும் தீவைத்தலும்
295|number|Insurgents attacking Sonepur pargana|700|சோன்பூர் பர்கானாவைத் தாக்கிய கிளர்ச்சியாளர்கள்|700
295|date|Date Sonepur pargana was raided|20 December 1831|சோன்பூர் பர்கானா தாக்கப்பட்ட தேதி|20 டிசம்பர் 1831
295|date|Date by which Kols controlled whole Chotanagpur|26 January 1832|கோல்கள் சோட்டாநாக்பூர் முழுவதையும் கட்டுப்படுத்திய தேதி|26 ஜனவரி 1832
295|person|Leader of Kol insurrection killed in battle|Buddha Bhagat|போரில் கொல்லப்பட்ட கோல் கிளர்ச்சி தலைவர்|புத்த பகத்
295|reward|Reward distributed for delivering Buddha Bhagat's severed head|Rs. 1000|புத்த பகத்தின் தலையை ஒப்படைத்ததற்கான பரிசுத் தொகை|ரூ.1000
295|person|Person who inspired Kol revolt and later surrendered|Bhindrai Manki|கோல் கிளர்ச்சியைத் தூண்டி பின்னர் சரணடைந்தவர்|பிந்த்ராய் மங்கி
295|date|Date Bhindrai Manki surrendered|19 March 1832|பிந்த்ராய் மங்கி சரணடைந்த தேதி|19 மார்ச் 1832

295|period|Santhal Hool period|1855–1856|சந்தால் ஹூல் கிளர்ச்சி காலம்|1855–1856
295|alternate|Another name used for Santhals|Manji|சந்தால்களுக்கு பயன்படுத்தப்பட்ட மற்றொரு பெயர்|மஞ்சி
295|region|One region where Santhals lived|Bengal|சந்தால்கள் வாழ்ந்த பகுதி|வங்காளம்
295|region|One region where Santhals lived|Bihar|சந்தால்கள் வாழ்ந்த பகுதி|பீகார்
295|region|One region where Santhals lived|Orissa|சந்தால்கள் வாழ்ந்த பகுதி|ஒரிசா
295|hills|Hills around which Santhals cleared new homeland|Rajmahal Hills|சந்தால்கள் புதிய குடியிருப்பு அமைத்த மலைப்பகுதி|ராஜ்மகல் குன்றுகள்
295|term|Name Santhals gave to their cleared homeland|Damin-i-koh|சந்தால்கள் தங்கள் புதிய நிலத்திற்கு வைத்த பெயர்|டாமின்-இ-கோ
295|meaning|Meaning of Damin-i-koh in lesson|Land of Santhals|டாமின்-இ-கோ என்பதன் பொருள்|சந்தால்களின் நிலம்
296|term|Santhal term for outsiders|Dikus|சந்தால்கள் வெளியாரை அழைத்த சொல்|டிக்குகள்
296|oppressor|One element of Santhal 'unholy trinity'|Zamindars|சந்தால்கள் குறிப்பிட்ட ஒடுக்குநர் மூவரில் ஒருவர்|ஜமீன்தார்கள்
296|oppressor|One element of Santhal 'unholy trinity'|Mahajans|சந்தால்கள் குறிப்பிட்ட ஒடுக்குநர் மூவரில் ஒருவர்|மஹாஜன்கள் / வட்டிக்கடைக்காரர்கள்
296|oppressor|One element of Santhal 'unholy trinity'|Government|சந்தால்கள் குறிப்பிட்ட ஒடுக்குநர் மூவரில் ஒருவர்|அரசாங்கம்
296|date|Month and year open Santhal insurrection began|July 1855|சந்தால்களின் வெளிப்படை கிளர்ச்சி தொடங்கிய காலம்|ஜூலை 1855
296|weapon|Traditional weapons used by Santhal rebels|Bows and arrows|சந்தால் கிளர்ச்சியாளர்கள் பயன்படுத்திய ஆயுதங்கள்|வில்லும் அம்பும்
296|battle|Battle where many Manjis wore red clothes|Battle of Maheshpur|மஞ்சிகள் சிவப்பு உடை அணிந்திருந்த போர்|மகேஷ்பூர் போர்
296|symbol|Colour that became an assertion of Santhal authority|Red|சந்தால் அதிகாரத்தின் அடையாளமாக மாறிய நிறம்|சிவப்பு
296|place|Village burnt in first week of Santhal rising|Monkaparrah|சந்தால் எழுச்சியின் முதல் வாரத்தில் எரிக்கப்பட்ட கிராமம்|மோங்கபர்ரா
296|number|Rebels in party that attacked Monkaparrah|10|மோங்கபர்ராவைத் தாக்கிய குழுவினர்|10
296|person|Initial leader of Santhal revolt|Sido|சந்தால் கிளர்ச்சியின் தொடக்கத் தலைவர்|சிதோ
296|person|Leader after Sido's arrest|Kanoo|சிதோ கைது செய்யப்பட்ட பின் தலைமை ஏற்றவர்|கானு
296|target|Industrial target raided by peasants|Charles Maseyk's indigo factory|விவசாயிகள் தாக்கிய தொழிற்சாலை|சார்ல்ஸ் மசேக் அவுரி தொழிற்சாலை
296|estimate|Estimated total Santhal rebels|30,000 to 50,000|சந்தால் கிளர்ச்சியாளர்களின் மதிப்பிடப்பட்ட மொத்தம்|30,000 முதல் 50,000
296|estimate|Estimated Santhal rebels killed|15,000 to 20,000|கொல்லப்பட்ட சந்தால் கிளர்ச்சியாளர்களின் மதிப்பீடு|15,000 முதல் 20,000

296|term|Munda rebellion's own name|Ulgulan|முண்டா கிளர்ச்சியின் உள்ளூர் பெயர்|உல்குலன்
296|period|Munda rebellion period|1899–1900|முண்டா கிளர்ச்சியின் காலம்|1899–1900
296|person|Leader of Munda rebellion|Birsa Munda|முண்டா கிளர்ச்சித் தலைவர்|பிர்சா முண்டா
296|region|Main region of Munda tribe in lesson|Bihar|பாடநூலில் முண்டாக்களின் முக்கிய பகுதி|பீகார்
296|system|Munda land system destroyed under British|Common land holdings|ஆங்கிலேய ஆட்சியில் அழிக்கப்பட்ட முண்டா நில முறை|பொதுநில உரிமை முறை
296|group|One group that grabbed Munda lands|Jagirdars|முண்டா நிலங்களைப் பறித்த ஒரு குழு|ஜாகீர்தார்கள்
296|group|One group that grabbed Munda lands|Thikadars|முண்டா நிலங்களைப் பறித்த ஒரு குழு|திக்காடர்கள்
296|group|One group that grabbed Munda lands|Moneylenders|முண்டா நிலங்களைப் பறித்த ஒரு குழு|வட்டிக்கடைக்காரர்கள்
296|date|Year Birsa Munda was born|1874|பிர்சா முண்டா பிறந்த ஆண்டு|1874
296|background|Birsa's family background|Poor share-cropper household|பிர்சாவின் குடும்பப் பின்னணி|ஏழை பங்கு விவசாயக் குடும்பம்
296|claim|Role Birsa declared for himself|Divine messenger|பிர்சா தன்னை அறிவித்த பங்கு|தெய்வீக தூதர்
296|goal|Political aim proclaimed by Birsa|Drive away British and establish Munda rule|பிர்சா அறிவித்த அரசியல் நோக்கம்|ஆங்கிலேயரை விரட்டி முண்டா ஆட்சி நிறுவுதல்
296|instruction|Birsa's instruction to Munda cultivators|Do not pay rent to zamindars|முண்டா விவசாயிகளுக்கு பிர்சா கூறிய அறிவுரை|ஜமீன்தார்களுக்கு வாடகை செலுத்தாதீர்கள்
296|region|Region where Birsa led revolt|Chotta Nagpur|பிர்சா கிளர்ச்சி நடத்திய பகுதி|சோட்டா நாக்பூர்
296|place|Place where Munda women were slaughtered|Sail Rakab|முண்டா பெண்கள் படுகொலை செய்யப்பட்ட இடம்|சாயில் ரகப்
296|place|Prison where Birsa died|Ranchi jail|பிர்சா இறந்த சிறை|ராஞ்சி சிறை
296|date|Date of Birsa Munda's death|9 June 1900|பிர்சா முண்டா இறந்த தேதி|9 ஜூன் 1900

296|debate|British imperialist interpretation of 1857|A mutiny among soldiers|1857 குறித்து பிரிட்டிஷ் பேரரசு வரலாற்றாசிரியர்களின் விளக்கம்|சிப்பாய்களின் கலகம்
296|person|Adjutant General who said mutiny became national insurrection|Col. Malleson|கலகம் தேசிய எழுச்சியாக மாறியது என கூறிய அட்ஜூடன்ட் ஜெனரல்|கர்னல் மாலெசன்
296|work|Pamphlet by Malleson|The Making of the Bengal Army|மாலெசன் எழுதிய துண்டுப்பிரசுரம்|The Making of the Bengal Army
297|person|Historian attributing 1857 to accumulated grievances and Dalhousie's policies|Keene|1857ஐ பல்வேறு குறைகளும் டல்ஹௌசி கொள்கைகளும் உருவாக்கின எனக் கூறிய வரலாற்றாசிரியர்|கீன்
297|factor|Trigger rather than sole cause of 1857|Greased cartridge affair|1857 கிளர்ச்சியின் ஒரே காரணமல்லாமல் தீப்பொறியாக அமைந்தது|கொழுப்பு தடவிய தோட்டாக்கள்
297|person|Historian describing 1857 as largely a real war of independence|Edward John Thompson|1857ஐ பெரும்பாலும் உண்மையான விடுதலைப் போர் எனக் கூறியவர்|எட்வர்ட் ஜான் தாம்சன்
297|person|Nationalist writer calling 1857 a war of independence|V.D. Savarkar|1857ஐ விடுதலைப் போர் என வாதிட்ட தேசியவாத எழுத்தாளர்|வி.டி. சாவர்க்கர்
297|book|Savarkar's work on 1857|The War of Indian Independence|சாவர்க்கரின் 1857 பற்றிய நூல்|The War of Indian Independence
297|date|Year Savarkar's book was published|1909|சாவர்க்கரின் நூல் வெளியான ஆண்டு|1909
297|term|Nationalist description of 1857|First War of Indian Independence|1857க்கு தேசியவாதிகள் வழங்கிய பெயர்|இந்தியாவின் முதல் விடுதலைப் போர்
297|policy|Dalhousie policy causing dissatisfaction among princes|Doctrine of Lapse|அரசர்களிடையே அதிருப்தி ஏற்படுத்திய டல்ஹௌசி கொள்கை|வாரிசு உரிமை இழப்புக் கொள்கை
297|state|One state annexed producing discontent before 1857|Oudh|1857க்கு முன் இணைக்கப்பட்டு அதிருப்தி ஏற்படுத்திய அரசு|அவத்
297|state|One state annexed producing discontent before 1857|Jhansi|1857க்கு முன் இணைக்கப்பட்டு அதிருப்தி ஏற்படுத்திய அரசு|ஜான்சி
297|person|Adopted son of last Peshwa humiliated by British|Nana Sahib|ஆங்கிலேயரால் அவமதிக்கப்பட்ட கடைசி பேஷ்வாவின் தத்துப் புதல்வர்|நானா சாஹிப்
297|commission|Bombay body investigating rent-free lands|Inam Commission|வரி விலக்கு நிலங்களை ஆய்வு செய்த பம்பாய் அமைப்பு|இனாம் கமிஷன்
297|date|Year Inam Commission appointed|1852|இனாம் கமிஷன் நியமிக்கப்பட்ட ஆண்டு|1852
297|number|Estates confiscated after Inam Commission inquiries|More than 21,000|இனாம் கமிஷன் விசாரணைக்கு பின் பறிமுதல் செய்யப்பட்ட எஸ்டேட்டுகள்|21,000க்கு மேல்
297|group|Oudh landed elite alienated by settlement|Talukdars|அவத் நில ஒப்பந்தத்தால் பாதிக்கப்பட்ட நில உயர்வினர்|தாலுக்தார்கள்
297|policy|British treatment of land revenue|As rent rather than tax|நிலவரியை ஆங்கிலேயர் கருதிய விதம்|வரி அல்ல, வாடகை என
297|effect|Revenue collection under British even when land not cultivated|Collected at same rate|நிலம் பயிரிடப்படாவிட்டாலும் பிரிட்டிஷ் வருவாய் வசூல்|அதே அளவில் வசூலிக்கப்பட்டது
297|group|Farmers especially harmed by heavy revenue and price crash|Small and marginal farmers and cultivating tenants|கனரக வரி மற்றும் விலை வீழ்ச்சியால் பாதிக்கப்பட்டோர்|சிறு, குறு விவசாயிகள் மற்றும் குத்தகை பயிரிடுவோர்
297|group|Community heavily dependent on public service before Company rule|Muslims|கம்பெனி ஆட்சிக்கு முன் அரசுப்பணியை அதிகம் சார்ந்த சமூகம்|முஸ்லிம்கள்
297|language|Court language abolished, reducing Muslim employment chances|Persian|நீதிமன்றங்களில் நீக்கப்பட்டதால் முஸ்லிம் வேலைவாய்ப்பை பாதித்த மொழி|பாரசீகம்
297|method|New public-service entry method reducing Muslim opportunities|Examination|முஸ்லிம் வேலைவாய்ப்பை குறைத்த புதிய அரசுப்பணி நுழைவு முறை|தேர்வு
297|act|Act of 1856 affecting high-caste sepoy recruitment|Enrolment Act of 1856|உயர்சாதி சிப்பாய் ஆட்சேர்ப்பை பாதித்த 1856 சட்டம்|1856 ஆட்சேர்ப்பு சட்டம்
297|reform|Social reform viewed as religious interference|Abolition of sati|மத தலையீடாகக் கருதப்பட்ட சமூக சீர்திருத்தம்|சதி ஒழிப்பு
297|reform|Social reform viewed as religious interference|Legalization of Hindu widow remarriage|மத தலையீடாகக் கருதப்பட்ட சமூக சீர்திருத்தம்|இந்து விதவை மறுமணம் சட்டபூர்வமாக்கல்
297|reform|Social reform viewed as religious interference|Prohibition of infanticide|மத தலையீடாகக் கருதப்பட்ட சமூக சீர்திருத்தம்|குழந்தைக் கொலைத் தடை
297|act|1850 act allowing Christian converts to retain inheritance|Lex Loci Act|கிறித்தவ மதமாற்றம் செய்தோர் சொத்து உரிமை வைத்திருக்க அனுமதித்த 1850 சட்டம்|லெக்ஸ் லோசி சட்டம்
297|date|Year Lex Loci Act was passed|1850|லெக்ஸ் லோசி சட்டம் இயற்றப்பட்ட ஆண்டு|1850
298|animal|Animal fat said to be used in cartridges offending Hindus|Cow|இந்துக்களின் மத உணர்வை புண்படுத்திய தோட்டா கொழுப்புடன் தொடர்புடைய விலங்கு|மாடு
298|animal|Animal fat said to be used in cartridges offending Muslims|Pig|முஸ்லிம்களின் மத உணர்வை புண்படுத்திய தோட்டா கொழுப்புடன் தொடர்புடைய விலங்கு|பன்றி
298|rifle|New rifle requiring sepoys to bite cartridge|Enfield rifle|சிப்பாய்கள் தோட்டாவை கடிக்க வேண்டிய புதிய துப்பாக்கி|என்ஃபீல்ட் துப்பாக்கி
298|place|Place where 1857 rebellion first began as mutiny|Barrackpore|1857 கிளர்ச்சி முதலில் கலகமாகத் தொடங்கிய இடம்|பாரக்க்பூர்
298|person|Sepoy associated with Barrackpore outbreak|Mangal Pandey|பாரக்க்பூர் எழுச்சியுடன் தொடர்புடைய சிப்பாய்|மங்கள் பாண்டே
298|date|Month in which lesson says Mangal Pandey killed his officer|January 1857|பாடநூலின்படி மங்கள் பாண்டே அதிகாரியை கொன்ற மாதம்|ஜனவரி 1857
298|place|Major sepoy centre where cartridge refusal followed Barrackpore|Meerut|பாரக்க்பூருக்குப் பின் தோட்டா மறுப்பு நடந்த முக்கிய சிப்பாய் மையம்|மீரட்
298|number|Sepoys ordered to receive cartridges at Meerut|90|மீரட்டில் தோட்டாக்களைப் பெற உத்தரவிடப்பட்ட சிப்பாய்கள்|90
298|number|Sepoys who obeyed cartridge order at Meerut|5|மீரட்டில் உத்தரவை ஏற்ற சிப்பாய்கள்|5
298|date|Date three sepoy regiments revolted at Meerut|10 May 1857|மீரட்டில் மூன்று சிப்பாய் ரெஜிமெண்டுகள் கிளர்ந்த தேதி|10 மே 1857
298|place|City seized by Meerut rebels the next day|Delhi|மீரட் கிளர்ச்சியாளர்கள் மறுநாள் கைப்பற்றிய நகரம்|டெல்லி
298|person|Mughal emperor proclaimed by rebels|Bahadur Shah II|கிளர்ச்சியாளர்கள் பேரரசராக அறிவித்த முகலாயர்|இரண்டாம் பகதூர் ஷா
298|region|Region fully in rebellion by June|Rohilkhand|ஜூன் மாதத்திற்குள் முழுமையாக கிளர்ச்சியில் இருந்த பகுதி|ரோஹில்கண்ட்
298|person|Leader who proclaimed himself viceroy of Emperor in Rohilkhand|Khan Bahadur Khan|ரோஹில்கண்டில் தன்னை பேரரசரின் வைஸ்ராய் என அறிவித்தவர்|கான் பகதூர் கான்
298|region|Region almost entirely up in arms|Bundelkhand|பெரும்பாலும் முழுதும் கிளர்ச்சியில் இருந்த பகுதி|புந்தேல்கண்ட்
298|region|Another region entirely up in arms|Doab|முழுவதும் கிளர்ச்சியில் இருந்த மற்றொரு பகுதி|தோஆப்
298|person|Young ruler enthroned at Jhansi|Rani Lakshmi Bai|ஜான்சியில் அரியணை ஏறிய இளம் ஆட்சியாளர்|ராணி லட்சுமிபாய்
298|age|Age of Lakshmi Bai stated in lesson|22|பாடநூலில் குறிப்பிடப்பட்ட லட்சுமிபாயின் வயது|22
298|person|Leader of rebels at Kanpur|Nana Sahib|கான்பூர் கிளர்ச்சித் தலைவர்|நானா சாஹிப்
298|number|English women and children cited in Kanpur massacre|About 125|கான்பூர் படுகொலையில் குறிப்பிடப்பட்ட ஆங்கில பெண்கள் மற்றும் குழந்தைகள்|சுமார் 125
298|person|British general sent against Nana Sahib after Kanpur massacre|Henry Havelock|கான்பூர் படுகொலைக்கு பின் நானா சாஹிபுக்கு எதிராக அனுப்பப்பட்டவர்|ஹென்றி ஹேவ்லாக்
298|person|British officer who carried out vengeance at Kanpur|Neill|கான்பூரில் கடுமையான பழிவாங்கலை மேற்கொண்டவர்|நீல்
298|person|Rebel leader who seized Kanpur near end of November|Tantia Topi|நவம்பர் இறுதியில் கான்பூரை கைப்பற்றிய கிளர்ச்சித் தலைவர்|தாந்தியா தோபி
298|person|British commander who soon recovered Kanpur|Campbell|கான்பூரை மீண்டும் கைப்பற்றிய ஆங்கில தளபதி|கேம்ப்பெல்
298|person|Defender of Lucknow Residency|Henry Lawrence|லக்னோ ரெசிடென்சியை காத்தவர்|ஹென்றி லாரன்ஸ்
298|person|Officer sent by John Lawrence to capture Delhi|John Nicholson|டெல்லியை கைப்பற்ற ஜான் லாரன்ஸ் அனுப்பியவர்|ஜான் நிக்கல்சன்
298|person|Authority who sent Nicholson|John Lawrence|நிக்கல்சனை டெல்லிக்கு அனுப்பியவர்|ஜான் லாரன்ஸ்
298|fate|Fate of Bahadur Shah II after Delhi fell|Taken prisoner|டெல்லி வீழ்ந்த பின் பகதூர் ஷா II இன் நிலை|கைதானார்
298|number|Royal relatives shot after surrender|Two sons and one grandson|சரணடைந்த பின் சுட்டுக் கொல்லப்பட்ட பகதூர் ஷாவின் உறவினர்கள்|இரு மகன்களும் ஒரு பேரனும்
298|cause|Reason resistance in Awadh lasted long|Participation of talukdars and peasants|அவத் எதிர்ப்பு நீண்டதற்கான காரணம்|தாலுக்தார்களும் விவசாயிகளும் பங்கேற்றனர்
298|person|Begum who led resistance in Lucknow|Begum Hazrat Mahal|லக்னோ எதிர்ப்பை வழிநடத்திய பேகம்|பேகம் ஹஸ்ரத் மஹால்
298|person|Nawab of Awadh whose wife was Hazrat Mahal|Wajid Ali Shah|ஹஸ்ரத் மஹாலின் கணவரான அவத் நவாப்|வாஜித் அலி ஷா
298|description|Oudh's military significance|Nursery of the Bengal Army|வங்காளப் படையில் அவத்தின் முக்கியத்துவம்|வங்காளப் படையின் ஆட்சேர்ப்பு தளம்
298|grievance|One sepoy grievance in Oudh|Low pay|அவத் சிப்பாய்களின் ஒரு குறை|குறைந்த ஊதியம்
298|grievance|One sepoy grievance in Oudh|Difficulty getting leave|அவத் சிப்பாய்களின் ஒரு குறை|விடுப்பு பெற சிரமம்
298|person|Local leader fighting with Hazrat Mahal|Raja Jailal Singh|ஹஸ்ரத் மஹாலுடன் போரிட்ட உள்ளூர் தலைவர்|ராஜா ஜெய்லால் சிங்
298|person|Son declared ruler of Oudh by Hazrat Mahal|Birjis Qadra|ஹஸ்ரத் மஹால் அவத் ஆட்சியாளராக அறிவித்த மகன்|பிர்ஜிஸ் காத்ரா
298|title|Title given to Birjis Qadra|Wali of Oudh|பிர்ஜிஸ் காத்ராவுக்கு வழங்கப்பட்ட பட்டம்|அவத்தின் வாலி
298|fate|Fate of Neill in Lucknow|Shot dead in street fighting|லக்னோவில் நீலின் முடிவு|தெருப்போரில் சுட்டுக் கொல்லப்பட்டார்
298|date|Month and year Lucknow finally captured by British|March 1858|லக்னோ இறுதியாக ஆங்கிலேயரால் கைப்பற்றப்பட்ட காலம்|மார்ச் 1858

299|person|British commander who besieged Jhansi|Hugh Rose|ஜான்சியை முற்றுகையிட்ட ஆங்கில தளபதி|ஹ்யூ ரோஸ்
299|person|Rebel leader defeated by Hugh Rose early in April|Tantia Topi|ஏப்ரல் தொடக்கத்தில் ஹ்யூ ரோஸால் தோற்கடிக்கப்பட்டவர்|தாந்தியா தோபி
299|place|City captured by Lakshmi Bai forcing Scindia to flee|Gwalior|லட்சுமிபாய் கைப்பற்றி சிந்தியாவை ஓடவைத்த நகரம்|குவாலியர்
299|person|Pro-British ruler forced to flee Gwalior|Scindia|குவாலியரிலிருந்து தப்பிய ஆங்கில ஆதரவு ஆட்சியாளர்|சிந்தியா
299|assessment|Hugh Rose's description of Lakshmi Bai|Best and bravest military leader of the rebels|லட்சுமிபாய் குறித்து ஹ்யூ ரோஸ் கூறிய மதிப்பீடு|கிளர்ச்சியாளர்களில் சிறந்ததும் வீரமிகுந்ததுமான இராணுவத் தலைவர்
299|place|Road in Madras where Neill's statue stood|Mount Road|நீலின் சிலை இருந்த மதராஸ் சாலை|மவுண்ட் ரோடு
299|government|Ministry that removed Neill's statue|Rajaji's Congress Ministry|நீலின் சிலையை அகற்றிய அமைச்சரவை|ராஜாஜியின் காங்கிரஸ் அமைச்சரவை
299|period|Rajaji Congress Ministry period cited|1937–1939|ராஜாஜி காங்கிரஸ் அமைச்சரவை குறிப்பிடப்பட்ட காலம்|1937–1939
299|place|Where Neill's statue was lodged after removal|Madras Museum|அகற்றப்பட்ட நீல் சிலை வைக்கப்பட்ட இடம்|சென்னை அருங்காட்சியகம்
299|date|Month and year Canning announced suppression and peace|July 1858|கிளர்ச்சி ஒடுக்கப்பட்டு அமைதி மீண்டது என கானிங் அறிவித்த காலம்|ஜூலை 1858
299|person|Rebel captured and executed in April 1859|Tantia Tope|ஏப்ரல் 1859இல் பிடிக்கப்பட்டு தூக்கிலிடப்பட்ட கிளர்ச்சியாளர்|தாந்தியா தோபி
299|date|Month and year Tantia Tope was executed|April 1859|தாந்தியா தோபி தூக்கிலிடப்பட்ட காலம்|ஏப்ரல் 1859
299|date|Month and year Bahadur Shah II was captured|September 1857|இரண்டாம் பகதூர் ஷா கைது செய்யப்பட்ட காலம்|செப்டம்பர் 1857
299|place|Place of exile of Bahadur Shah II|Rangoon (Myanmar)|இரண்டாம் பகதூர் ஷா நாடுகடத்தப்பட்ட இடம்|ரங்கூன் (மியான்மர்)
299|date|Month and year Bahadur Shah II died|November 1862|இரண்டாம் பகதூர் ஷா இறந்த காலம்|நவம்பர் 1862
299|age|Age of Bahadur Shah II at death|87|இறந்தபோது இரண்டாம் பகதூர் ஷாவின் வயது|87
299|effect|Dynasty ending with death of Bahadur Shah II|Mughal dynasty|இரண்டாம் பகதூர் ஷா இறப்புடன் முடிந்த வம்சம்|முகலாய வம்சம்
299|event|Royal Durbar associated with Queen's Proclamation|Allahabad Durbar|ராணியின் பிரகடனத்துடன் தொடர்புடைய அரச தர்பார்|அலகாபாத் தர்பார்
299|date|Date of Royal Durbar for Queen's Proclamation|1 November 1858|ராணியின் பிரகடன அரச தர்பார் நடந்த தேதி|1 நவம்பர் 1858
299|person|Queen who issued 1858 Proclamation|Queen Victoria|1858 பிரகடனம் வெளியிட்ட ராணி|விக்டோரியா மகாராணி
299|person|Official who read Queen's Proclamation at Durbar|Lord Canning|தர்பாரில் ராணியின் பிரகடனத்தை வாசித்தவர்|லார்ட் கானிங்
299|status|Canning's transition in 1858|Last Governor-General and first Viceroy|1858இல் கானிங்கின் பதவி மாற்றம்|கடைசி கவர்னர் ஜெனரலும் முதல் வைஸ்ராயும்
299|office|British official through whom India would be governed|Secretary of State|இந்தியா ஆளப்பட வேண்டிய பிரிட்டிஷ் அதிகாரி|அரசுச் செயலர்
299|number|Members in Council of India assisting Secretary of State|15|அரசுச் செயலருக்கு உதவிய இந்திய கவுன்சில் உறுப்பினர்கள்|15
299|body|Company body abolished after 1858|Court of Directors|1858க்குப் பின் கலைக்கப்பட்ட கம்பெனி அமைப்பு|இயக்குநர் மன்றம்
299|body|Another Company body abolished after 1858|Board of Control|1858க்குப் பின் கலைக்கப்பட்ட மற்றொரு அமைப்பு|கட்டுப்பாட்டு வாரியம்
299|army|Fate of East India Company's separate army|Merged with Crown army|கிழக்கிந்தியக் கம்பெனியின் தனிப்படை என்ன ஆனது|கிரௌன் படையுடன் இணைக்கப்பட்டது
299|promise|Proclamation's pledge regarding Indian princes|Respect rights, dignity and honour|இந்திய இளவரசர்களுக்கு பிரகடனத்தின் உறுதி|உரிமை, கண்ணியம், மரியாதை மதிக்கப்படும்
299|policy|Expansion policy disavowed by Queen's Proclamation|Further extension of British possessions|ராணியின் பிரகடனம் கைவிட்ட விரிவாக்க நோக்கம்|பிரிட்டிஷ் பகுதிகளை மேலும் விரிவாக்குதல்
299|date|Year of council reform providing Indian nomination|1861|இந்திய நியமனத்தை கொண்ட புதிய கவுன்சில் அமைந்த ஆண்டு|1861
299|criticism|Problem with Legislative Council of 1853|Only Europeans and no consultation of Indian opinion|1853 சட்டமன்றக் கவுன்சிலின் குறை|ஐரோப்பியர்கள் மட்டும்; இந்திய கருத்து ஆலோசிக்கப்படவில்லை
299|policy|Annexation doctrine abandoned after revolt|Doctrine of Lapse|கிளர்ச்சிக்குப் பின் கைவிடப்பட்ட இணைப்புக் கொள்கை|வாரிசு உரிமை இழப்புக் கொள்கை
299|policy|General pardon promised after revolt|Amnesty except direct killers of British subjects|கிளர்ச்சிக்குப் பின் அறிவிக்கப்பட்ட பொதுமன்னிப்பு|ஆங்கிலேயரை நேரடியாக கொன்றோர் தவிர மற்ற கிளர்ச்சியாளர்களுக்கு மன்னிப்பு
299|development|One public work stimulated after 1857 for troop movement|Roads|1857க்குப் பின் படை நகர்வுக்காக ஊக்குவிக்கப்பட்ட பொதுப்பணி|சாலைகள்
299|development|One public work stimulated after 1857 for troop movement|Railways|1857க்குப் பின் படை நகர்வுக்காக ஊக்குவிக்கப்பட்ட பொதுப்பணி|இருப்புப்பாதைகள்
299|development|One public work stimulated after 1857 for troop movement|Telegraphs|1857க்குப் பின் படை நகர்வுக்காக ஊக்குவிக்கப்பட்ட பொதுப்பணி|தந்தி
299|development|One public work stimulated after 1857 for troop movement|Irrigation|1857க்குப் பின் ஊக்குவிக்கப்பட்ட பொதுப்பணி|பாசனம்
299|effect|New social group emerging after traditional structure weakened|Westernized English-educated middle class|பாரம்பரிய அமைப்பு சிதைந்த பின் உருவான புதிய சமூகக் குழு|மேலைநோக்கு ஆங்கிலக் கல்வி பெற்ற நடுத்தர வர்க்கம்
299|effect|Political outlook strengthened among new middle class|Nationalism|புதிய நடுத்தர வர்க்கத்தில் வலுவடைந்த அரசியல் உணர்வு|தேசியவாதம்
""".strip()

facts=[]
seen=set()
for line in RAW.splitlines():
    if not line.strip(): continue
    parts=line.split("|")
    if len(parts)!=6:
        raise ValueError(f"Bad fact line ({len(parts)}): {line}")
    p,k,de,ae,dt,at=parts
    key=(" ".join(de.split()).lower()," ".join(ae.split()).lower())
    if key in seen: continue
    seen.add(key)
    facts.append({"page_en":int(p),"kind":k,"desc_en":" ".join(de.split()),"ans_en":" ".join(ae.split()),"desc_ta":" ".join(dt.split()),"ans_ta":" ".join(at.split())})

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
      "id":f"C11H18-Q{qid:04d}",
      "quiz":(qid-1)//20+1,
      "page_en":page,
      "q_en":qen,"q_ta":qta,
      "opts_en":oe,"opts_ta":ot,
      "correct":c,"exp_en":een,"exp_ta":eta,"type":typ
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
        oe,ot,c=make_opts(f,18000+i*43+j*100003)
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
    q["id"]=f"C11H18-Q{i:04d}"
    q["quiz"]=(i-1)//20+1

quiz_count=(len(questions)+19)//20
sets=[{"id":i,"title_en":f"Quiz {i} · Competitive Review","title_ta":f"வினாடி வினா {i} · போட்டித் தேர்வு மீள்பார்வை"} for i in range(1,quiz_count+1)]
counts=Counter("ABCD"[q["correct"]] for q in questions)
dups=len(questions)-len({(q["q_en"],tuple(q["opts_en"])) for q in questions})

out={"meta":{
  "board":"Tamil Nadu State Board","class":11,"subject":"History","edition":2025,"unit":18,
  "unit_en":"Early Resistance to British Rule","unit_ta":"ஆங்கிலேயர் ஆட்சிக்குத் தொடக்ககால எதிர்ப்புகள்",
  "source":"Government of Tamil Nadu Higher Secondary First Year History, Revised Edition 2025, English and Tamil editions supplied by the user",
  "total_questions":len(questions),"base_facts":len(facts),"quiz_sets":sets,
  "question_style":"Maximum useful source-grounded bilingual competitive-exam coverage from Unit 18: Haider Ali and Tipu Sultan and the four Anglo-Mysore Wars; origin and resistance of southern Palayakkarars; Puli Thevar, Yusuf Khan, Velu Nachiyar and Veera Pandiya Kattabomman; Marudu Brothers and South Indian Rebellion; Theeran Chinnamalai; Vellore Revolt; Malabar/Mappilla, Kol, Santhal and Munda uprisings; causes and course of the Great Rebellion of 1857; Queen's Proclamation and post-rebellion changes.",
  "quality_policy":"Four-option bilingual MCQs grounded in the supplied 2025 English and Tamil textbooks. Low-value assignments are excluded. Examinable facts are reinforced through direct recall, association, recognition and statement-analysis formats. The textbook's own chronology, terminology and framing are retained.",
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
