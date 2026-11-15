"use strict";
const root=document.querySelector('#root'), dialog=document.querySelector('#dialog');
const labels={
 signIn:'Sign in|تسجيل الدخول',register:'Create account|إنشاء حساب',email:'Email|البريد الإلكتروني',password:'Password (12+ characters)|كلمة المرور (١٢ حرفاً فأكثر)',tag:'Farm workspace|مساحة عمل المزرعة',welcome:'See satellite observations and soil readings for your field.|قياسات الأقمار الصناعية والتربة لحقلك.',
 overview:'Field overview|نظرة على الحقل',map:'Satellite map|خريطة الأقمار الصناعية',rotation:'Rotation planner|تخطيط الدورة الزراعية',sensors:'Reading setup|إعداد القراءات',sources:'Data sources|مصادر البيانات',learn:'Cover crop guides|أدلة محاصيل الغطاء',signout:'Sign out|تسجيل الخروج',add:'Add field|أضف حقلاً',edit:'Edit field|تعديل الحقل',selectField:'Select a field|اختر حقلاً',
 start:'Add your first field|أضف حقلك الأول',startBody:'Name your field and place a pin or draw its boundary.|سمِّ الحقل وحدد موقعه أو ارسم حدوده.',name:'Field name|اسم الحقل',country:'Country|الدولة',crop:'Current crop|المحصول الحالي',palm:'Date palms|نخيل التمر',vegetables:'Vegetables|خضروات',other:'Other|أخرى',lat:'Latitude|خط العرض',lon:'Longitude|خط الطول',pin:'Place pin|حدد نقطة',draw:'Draw boundary|ارسم الحدود',clear:'Clear boundary|امسح الحدود',close:'Close|إغلاق',save:'Save|حفظ',
 baseline1:'Current rotation, first crop|الدورة الحالية، المحصول الأول',baseline2:'Current rotation, second crop|الدورة الحالية، المحصول الثاني',thresholds:'Farm limits|حدود الحقل',dry:'Dry threshold (%)|حد الجفاف (%)',wet:'Wet threshold (%)|حد الرطوبة (%)',maxEc:'Irrigation water EC limit (dS/m)|حد توصيل المياه (dS/m)',eventLimit:'Irrigation event target (L)|هدف الري للدورة (L)',depth:'Probe depth (cm)|عمق المستشعر (cm)',ece:'Lab soil ECe (dS/m)|ملوحة التربة المخبرية (dS/m)',
 look:'What needs attention|ما الذي يحتاج إلى متابعة؟',snapshot:'Farm measurements|قياسات المزرعة',waiting:'Waiting for readings|بانتظار القراءات',moisture:'Soil moisture|رطوبة التربة',ec:'Irrigation water conductivity (ECw)|توصيل مياه الري ECw',volume:'Irrigation event volume|حجم مياه الري',soilTemp:'Probe temperature|حرارة المستشعر',dryAction:'Soil is below your dry threshold. Check the probe and drip emitters.|الرطوبة أقل من حد الجفاف المحدد. افحص المستشعر والنقاطات.',saltAction:'Water conductivity exceeds your limit. Review water quality and the lab soil test.|توصيل المياه يتجاوز الحد المحدد. راجع جودة المياه وتحليل التربة.',volumeAction:'Recorded irrigation exceeds your target and soil is wet. Review the flow reading and planned salt leaching.|الري المسجل يتجاوز الهدف والتربة رطبة. راجع قراءة التدفق وغسيل الأملاح المخطط.',noFlags:'No field reading crossed a configured limit.|لم تتجاوز القراءات حدود الحقل المحددة.',setLimits:'Add calibrated thresholds in Edit field to enable field alerts.|أضف حدوداً معايرة في تعديل الحقل لتفعيل التنبيهات.',old:'Latest measurement is older than one hour. Check the device connection.|آخر قياس أقدم من ساعة. تحقق من اتصال الجهاز.',
 pair:'Connect a sensor|اربط مستشعرًا',pairBody:'Use the device token in the Authorization header. Save it now. It is shown once.|استخدم الرمز في ترويسة Authorization واحفظه الآن. يظهر مرة واحدة.',device:'Device name|اسم الجهاز',rotate:'Replace token|استبدال الرمز',import:'Import measured CSV|استيراد قراءات CSV',csvHelp:'CSV columns: timestamp, moisture_pct, ecw_dsm, soil_ec_dsm, litres, soil_temp_c. Raw probe imports can use timestamp, raw_adc, probe_calibration.|للبيانات الخام استخدم timestamp, raw_adc, probe_calibration.',observed:'Observed|تاريخ القياس',received:'Received|تاريخ الاستلام',manual:'CSV import|ملف CSV',reading:'Check the reading format and timestamp.|تحقق من صيغة القراءة والوقت.',saved:'Saved|تم الحفظ',loading:'Loading…|جارٍ التحميل…',unavailable:'Source unavailable. Try again later.|المصدر غير متاح. حاول لاحقاً.',empty:'No records for this request.|لا توجد سجلات لهذا الطلب.',serverError:'The request could not be completed.|تعذر إتمام الطلب.',badLogin:'Check your email and password.|تحقق من البريد وكلمة المرور.',credentials:'Enter a valid email and password of 12–128 characters.|أدخل بريداً صالحاً وكلمة مرور من ١٢ إلى ١٢٨ حرفاً.',emailUsed:'This email already has an account.|البريد مستخدم بالفعل.',invalidField:'Check the field inputs and thresholds.|تحقق من بيانات الحقل والحدود.',rate:'Too many requests. Try again later.|طلبات كثيرة. حاول لاحقاً.',
 earth:'Earth observations|رصد الأرض',imagery:'Aerial imagery|صور جوية',layer:'Layer|الطبقة',day:'Layer date|تاريخ الطبقة',apply:'Apply|تطبيق',earthView:'Open in Google Earth|افتح في Google Earth',coverage:'Satellite overlays may be blank where no observation was available for the selected date.|قد تغيب الطبقة عند عدم توفر رصد في التاريخ المحدد.',granules:'Earthdata scene catalogue|فهرس مشاهد Earthdata',granuleInfo:'Scene metadata indicates catalogue coverage. Check quality, cloud and pixel coverage before using a scene.|بيانات الفهرس توضح التغطية. افحص الجودة والسحب قبل استخدام المشهد.',load:'Load|تحميل',refresh:'Refresh|تحديث',lastCheck:'Retrieved|آخر جلب',cached:'Cached response|نتيجة مخزنة',regional:'Regional model estimate, about 9 km. Compare with your probe separately.|تقدير نموذجي إقليمي بنحو ٩ كم. قارن بمستشعر الحقل بشكل منفصل.',power:'NASA POWER weather history|سجل الطقس NASA POWER',chart:'Observation trend|اتجاه القياسات',altSources:'Additional challenge resources|مصادر إضافية للتحدي',refOnly:'Reference only|مرجع فقط',regionUS:'United States coverage|تغطية الولايات المتحدة',regionNA:'North America coverage|تغطية أمريكا الشمالية',
 planSub:'Compare your current rotation with two alternatives. Enter each option’s estimated seasonal water use to see what fits your budget.|قارن دورتك الزراعية الحالية بخيارين. أدخل الاستهلاك الموسمي المقدّر لكل خيار لمعرفة ما يناسب ميزانيتك المائية.',budget:'Seasonal water budget (mm)|ميزانية المياه الموسمية (مم)',priority:'Priority|الأولوية',water:'Water|المياه',cover:'Ground cover|غطاء التربة',harvest:'Harvest opportunities|فرص الحصاد',base:'Current rotation|الدورة الحالية',legume:'Legume cover|غطاء بقولي',mixed:'Different crop families|عائلات نباتية مختلفة',waterEntry:'Your estimated irrigation (mm)|تقديرك للري (مم)',needs:'Enter a water estimate|أدخل تقدير المياه',fits:'Fits your budget|ضمن ميزانيتك',above:'Above your budget|يتجاوز ميزانيتك',review:'Check soil salinity, crop tolerance and available equipment before planting.|تحقق من ملوحة التربة وتحمل المحصول والمعدات قبل الزراعة.',local:'UAE planting windows follow the Ministry of Climate Change and Environment calendar.|تستند مواعيد الزراعة في الإمارات إلى تقويم وزارة التغير المناخي والبيئة.',blankRotation:'Enter the crops currently grown in Edit field.|أدخل المحاصيل الحالية في تعديل الحقل.',cowpea:'Cowpea cover · Sep–Nov|غطاء لوبيا · سبتمبر–نوفمبر',zucchini:'Zucchini · Mar–Apr|كوسا · مارس–أبريل',lettuce:'Lettuce · Oct–Dec|خس · أكتوبر–ديسمبر',okra:'Okra · Mar–Apr|بامية · مارس–أبريل',legumeWhy:'The cover protects bare soil. Include its establishment water and plan termination before the next crop.|يحمي الغطاء التربة. احسب مياه التأسيس وخطط لإنهائه قبل المحصول التالي.',mixedWhy:'A change of crop family changes the harvest calendar and may break some pest cycles.|تغيير العائلة النباتية يغير مواعيد الحصاد وقد يقطع بعض دورات الآفات.',intercrop:'Trial between palm rows|تجربة بين صفوف النخيل',intercropBody:'Start with one strip. Check shade, irrigation overlap, seeder clearance and cover-crop termination equipment.|ابدأ بشريط واحد. تحقق من الظل وتداخل الري ومساحة آلة البذر ومعدات إنهاء الغطاء.',ranked:'Best match for this priority|الأقرب إلى هذه الأولوية',inputs:'Fit depends on cultivar, farm data and local review.|تعتمد الملاءمة على الصنف وبيانات الحقل والمراجعة المحلية.',solar:'Heat and plant cooling|الحرارة وتبريد النبات',solarBody:'Compare surface temperature with probe moisture to decide where to inspect.|قارن حرارة السطح مع رطوبة التربة لتحديد مكان الفحص.',salts:'Wet soil and salt stress|تربة رطبة وإجهاد ملحي',saltsBody:'Water conductivity and lab soil salinity answer different questions.|توصيل مياه الري وملوحة التربة المخبرية قياسان مختلفان.',play:'Play illustration|شغّل الرسم',pause:'Pause|أوقف مؤقتاً',sourceLabel:'Source|المصدر',fieldSelection:'Click the map to place the field pin or add boundary vertices.|انقر على الخريطة لتحديد النقطة أو إضافة رؤوس الحدود.',signed:'Signed in|تم تسجيل الدخول'
};
Object.assign(labels,{publicGuides:'Project showcase and setup|عرض المشروع ودليل الإعداد',thermalNeed:'The server needs NASA Earthdata authorization to read ECOSTRESS pixels.|يحتاج الخادم إلى تصريح Earthdata لقراءة بيانات ECOSTRESS.',thermalLegend:'Clear-sky surface temperature around the field pin, in °C. Each dot is an original sample location.|حرارة سطح صافية حول نقطة الحقل بالدرجة المئوية. كل نقطة موقع قياس أصلي.',thermalLatest:'Latest usable ECOSTRESS pass|أحدث مرور صالح لـ ECOSTRESS',savePlans:'Save rotation inputs|احفظ مدخلات الدورة',noThreshold:'Add measured constraints to compare these options.|أضف القيود المقاسة لمقارنة الخيارات.',openFieldHeat:'Find hot areas on the map|اعثر على المناطق الساخنة في الخريطة',goSat:'See satellite map|افتح خريطة الأقمار الصناعية'});
Object.assign(labels,{
  forecast:'Five-day forecast|توقعات خمسة أيام',heat:'Crop air-temperature limit (°C)|حد حرارة الهواء للمحصول',heatWatch:'Forecast heat watch. Check the crop and irrigation zone on the dates above your threshold.|تنبيه حرارة متوقعة. افحص المحصول ومنطقة الري في الأيام التي تتجاوز الحد.',
  dryWatch:'Drying watch. Recent regional moisture is below the preceding period. Check the field probe and upcoming rainfall.|تنبيه جفاف. الرطوبة الإقليمية أقل من الفترة السابقة. تحقق من المستشعر والأمطار المتوقعة.',
  forecastNote:'Open-Meteo model forecast. ET₀ is reference water demand, not an irrigation prescription.|توقعات نموذج Open-Meteo. ‏ET₀ احتياج مرجعي للمياه وليس وصفة للري.',
  forecastDetails:'Daily forecast and water estimate|التوقعات اليومية وتقدير المياه',
  forecastStale:'Forecast cache is stale. Refresh before relying on it.|التوقع المخزن قديم. حدّثه قبل الاعتماد عليه.',
  uaFocus:'For UAE farms, start with root-zone checks, surface heat and irrigation salinity.|في مزارع الإمارات، ابدأ بفحص رطوبة منطقة الجذور وحرارة السطح وملوحة مياه الري.',
  auFocus:'Use ECOSTRESS for surface heat and Landsat for vegetation change. For bushfire warnings check your state emergency service.|استخدم ECOSTRESS للحرارة وLandsat لتغير الغطاء النباتي. راجع خدمات الطوارئ المحلية لتحذيرات الحرائق.',
  genericFocus:'Start with the most recent field readings and check satellite coverage around your farm.|ابدأ بأحدث قراءات الحقل وتحقق من التغطية حول المزرعة.',
  smapMap:'Open the dated SMAP layer|افتح طبقة SMAP المؤرخة',
  sw:'Shortwave radiation|الإشعاع الشمسي',maxAir:'Max air temperature|أقصى حرارة للهواء',rh:'Relative humidity|الرطوبة النسبية',rain:'Rainfall|الأمطار',surface:'Surface soil moisture|رطوبة سطح التربة',rootMoist:'Root-zone soil moisture|رطوبة منطقة الجذور',
  coverSteps:'Cover-crop checklist|خطوات محاصيل الغطاء',sow:'Check the sowing window and available water.|تحقق من موعد البذر والمياه المتاحة.',monitor:'Monitor establishment and water use in a trial strip.|راقب الإنبات واستهلاك المياه في شريط تجريبي.',terminate:'Select termination equipment and plan residue before sowing the next crop.|اختر معدات إنهاء الغطاء وخطط للبقايا قبل زراعة المحصول التالي.',fitEquipment:'Machinery and clearance|المعدات ومساحة المرور',
  calendarSource:'UAE planting calendar|تقويم الزراعة في الإمارات',publicPage:'Project and videos|المشروع والمقاطع'
});
Object.assign(labels,{
  soilLab:'Open soil model simulation|افتح محاكاة نموذج التربة',
  probeIndex:'Relative probe wetness|مؤشر رطوبة المستشعر النسبي',
  probeIndexNote:'0–100 index calibrated in air and water. Soil water content needs a soil-specific calibration.|مؤشر من ٠ إلى ١٠٠ تمت معايرته في الهواء والماء. قياس محتوى التربة المائي يتطلب معايرة خاصة بالتربة.',
  rawAdc:'Raw ADC|قراءة المستشعر الخام',
  adcRail:'Probe reading reached the ADC limit. Check the sensor and wiring if this persists in soil.|بلغت القراءة حد محوّل الإشارة. افحص المستشعر والتوصيلات إذا استمرت القراءة في التربة.',
  indexAlerts:'Soil-moisture alerts use calibrated moisture percentages. The relative index is shown for tracking only.|تستخدم تنبيهات رطوبة التربة نسباً معايرة. يعرض المؤشر النسبي للمتابعة فقط.'
});
Object.assign(labels,{
  fieldCheck:'What to check|ما الذي يجب فحصه',
  salinity:'Salinity|الملوحة',
  heatStress:'Heat stress|الإجهاد الحراري',
  thermalUnavailable:'A field-scale satellite reading is unavailable. Check regional heat and your local forecast below.|قراءة حرارة الحقل بالأقمار الصناعية غير متوفرة. راجع حرارة المنطقة والتوقعات المحلية أدناه.',
  heatIntro:'Check which areas have hot surfaces and when hot weather is expected.|اعرف المناطق التي ترتفع فيها حرارة السطح ومتى يُتوقع طقس حار.',
  moistureIntro:'See whether your field is too dry, too wet, or within the range you set.|اعرف ما إذا كانت تربة حقلك جافة أو رطبة أكثر من اللازم أو ضمن النطاق الذي حددته.',
  saltIntro:'Track salts in your soil and irrigation water.|تابع ملوحة التربة ومياه الري.',
  regionalMoisture:'Regional soil moisture|رطوبة التربة في المنطقة',
  moistureDemo:'Example field. Add your field to see moisture alerts.|هذا حقل نموذجي. أضف حقلك لتلقي تنبيهات الرطوبة.',
  saltDemo:'Add your field and connect a salinity reading to check its salt levels.|أضف حقلك وسجّل قراءة للملوحة لمعرفة مستوى الأملاح.',
  benchPlain:'The setup page includes recorded probe readings from a bench test.|تتضمن صفحة الإعداد قراءات مسجلة للمستشعر من اختبار مخبري.',
  moistureMissing:'No calibrated moisture reading yet.|لا توجد قراءة معايرة لرطوبة التربة بعد.',
  saltMissing:'No soil salinity reading yet.|لا توجد قراءة لملوحة التربة بعد.',
  olderReading:'Last reading is over an hour old. Check the field again.|مرّت أكثر من ساعة على آخر قراءة. افحص الحقل مجددًا.',
  moistureSetup:'Set your dry and wet limits in Edit field.|حدّد حدود الجفاف والرطوبة من خلال تعديل الحقل.',
  saltSetup:'Set a limit for your soil salinity reading in Edit field.|حدّد حد ملوحة التربة من خلال تعديل الحقل.',
  inRange:'Within the limits you set.|القراءة ضمن الحدود التي حددتها.',
  tooDry:'Your soil is too dry.|تربة حقلك جافة أكثر من اللازم.',
  tooMuchWater:'This irrigation event exceeded your water target.|تجاوزت دفعة الري هذه كمية المياه المستهدفة.',
  tooWet:'Your soil is too wet.|تربة حقلك رطبة أكثر من اللازم.',
  soilSaltHigh:'Your soil is too salty.|تربة حقلك مالحة أكثر من اللازم.',
  labHigh:'The recorded lab result exceeds your soil salinity limit.|تتجاوز نتيجة المختبر المسجلة الحد الذي حددته لملوحة التربة.',
  waterSaltHigh:'Irrigation water salinity is above your limit.|ملوحة مياه الري أعلى من الحد الذي حددته.',
  saltNext:'Confirm with a fresh reading. Check your irrigation water and drainage before changing irrigation.|أكّد النتيجة بقراءة حديثة. افحص مياه الري والصرف قبل تغيير خطة الري.',
  dryNext:'Check moisture near the roots before the next irrigation.|افحص الرطوبة حول الجذور قبل الري التالي.',
  wetNext:'Check for ponding, leaks, and slow drainage before the next irrigation.|تحقق من تجمع المياه والتسرب وبطء الصرف قبل الري التالي.',
  relativeOnly:'This probe reports a relative reading. It needs soil calibration before it can trigger dry or wet alerts.|يعطي هذا المستشعر قراءة نسبية. يلزم ضبط معايرته في التربة قبل إصدار تنبيهات الجفاف أو الرطوبة.',
  labSalt:'Recorded soil lab result|نتيجة مختبر التربة المسجلة',
  waterSalt:'Irrigation water salinity|ملوحة مياه الري',
  soilEC:'Soil probe salinity|ملوحة التربة من المستشعر',
  soilEcLimit:'Soil probe salinity limit (dS/m)|حد ملوحة التربة للمستشعر (ديسي سيمنز/م)',
  labEcLimit:'Lab soil salinity limit (dS/m)|حد ملوحة التربة لنتيجة المختبر (ديسي سيمنز/م)',
  surfaceHeat:'Satellite surface heat|حرارة السطح من الأقمار الصناعية',
  surfaceHeatLabel:'Satellite surface heat limit (°C)|حد حرارة السطح من الأقمار الصناعية',
  heatActions:'What to do in high heat|ما العمل عند ارتفاع الحرارة',
  heatNext:'Walk the hottest zones, check moisture near the roots, and inspect irrigation lines. Consider crop-appropriate shade or mulch for exposed areas.|تفقد المناطق الأشد حرارة وافحص الرطوبة حول الجذور وخطوط الري. استخدم ظلًا أو غطاء تربة مناسبًا للمحصول في المناطق المكشوفة.',
  satelliteHeatWatch:'Some areas near your field pin meet or exceed your surface heat limit.|تبلغ حرارة السطح في بعض المناطق القريبة من نقطة الحقل الحد الذي حددته أو تتجاوزه.',
  oldHeat:'Earlier satellite observation. Check the forecast and current field conditions.|هذه مشاهدة سابقة. تحقق من التوقعات وظروف الحقل الحالية.',
  heatLimitHelp:'Set a surface heat limit for this field to flag hot areas on the map.|حدّد حد حرارة السطح لهذا الحقل لإبراز المناطق الساخنة على الخريطة.',
  hotPixels:'usable map samples exceed or meet the set limit.|من العينات الصالحة على الخريطة بلغت الحد المحدد أو تجاوزته.',
  saltContext:'How we check salinity|كيف نتحقق من الملوحة',
  saltMethod:'Soil salinity alerts use a calibrated soil probe or a lab result. NASA moisture and heat maps help you choose where to check the field.|تعتمد تنبيهات ملوحة التربة على مستشعر معاير أو نتيجة مختبر. تساعدك خرائط ناسا للرطوبة والحرارة على اختيار أماكن الفحص.',
  saltGuide:'FAO guide to soil and water salinity|دليل منظمة الأغذية والزراعة لملوحة التربة والمياه',
  coverGuide:'Cover crop guides|أدلة محاصيل الغطاء',
  guideStart:'How cover crops protect soil|كيف تحمي محاصيل الغطاء التربة',
  guideTrial:'Plan and manage a trial strip|خطّط لشريط تجريبي واعتنِ به',
  guideField:'Check heat and water before sowing|تحقق من الحرارة والمياه قبل الزراعة',
  coverVideoNote:'English narration with English and Arabic captions.|سرد صوتي بالإنجليزية مع ترجمة نصية بالإنجليزية والعربية.',
  coverTiming:'When to try a cover crop|متى تجرّب محصول غطاء',
  coverUae:'For the UAE cowpea example, review the September–November window. Check that soil, irrigation and harvest timing suit your field before sowing a trial strip.|في مثال اللوبيا في الإمارات، راجع فترة سبتمبر إلى نوفمبر. تأكد من ملاءمة التربة والري وموعد الحصاد قبل زراعة شريط تجريبي.',
  coverUaeWait:'The UAE cowpea example uses a September–November window. For other dates, check your local planting calendar and irrigation supply.|يستخدم مثال اللوبيا في الإمارات فترة سبتمبر إلى نوفمبر. في الأشهر الأخرى، راجع تقويم الزراعة المحلي ومياه الري المتاحة.',
  coverLocal:'Use your local planting calendar to choose a cover crop for the gap between harvests.|استخدم تقويم الزراعة المحلي لاختيار محصول غطاء للفترة بين المواسم.',
  coverWeather:'Hot weather exceeds your limit in the five-day forecast. Check establishment water and consider waiting for a cooler planting window.|تتجاوز الحرارة الحد الذي حددته في توقعات الأيام الخمسة. تحقق من مياه الإنبات وفكّر في انتظار فترة زراعة أبرد.',
  coverWeatherAvailable:'Five-day forecast available. Check reference water demand before committing to a trial strip.|توقعات الأيام الخمسة متوفرة. راجع الاحتياج المائي المرجعي قبل بدء شريط تجريبي.',
  coverWeatherMissing:'A current forecast is unavailable. Check local weather before sowing.|التوقعات الحالية غير متوفرة. تحقق من الطقس المحلي قبل الزراعة.',
  regionalDemo:'Umm Al Quwain reference site|موقع مرجعي في أم القيوين',
  archiveFile:'View the archived readings|اعرض القراءات المؤرشفة',
  demoArchive:'Dated SMAP Level 4 archive|أرشيف SMAP للمستوى الرابع حسب التاريخ',
  budgetMargin:'Water budget remaining|المتبقي من ميزانية المياه',
  budgetOver:'Water needed above budget|المياه المطلوبة فوق الميزانية',
  tryTighter:'Try a 400 mm budget|جرّب ميزانية قدرها ٤٠٠ مم',
  resetBudget:'Reset example|إعادة ضبط المثال',
  reasonWater:'Uses the least water of the options within budget.|يستهلك أقل كمية من المياه بين الخيارات التي تناسب الميزانية.',
  reasonCover:'Prioritizes covering bare soil among the options within budget.|يعطي الأولوية لتغطية التربة المكشوفة بين الخيارات التي تناسب الميزانية.',
  reasonHarvest:'Favors keeping the current rotation when it fits the budget.|يفضّل الإبقاء على الدورة الحالية عندما تناسب ميزانية المياه.',
  noPlanFits:'Every rotation with an estimate exceeds this water budget.|تتجاوز التقديرات المدخلة حتى الآن ميزانية المياه.',
  noPlanEstimates:'Enter a water estimate for at least one rotation to compare it with your budget.|أدخل تقديرًا للمياه لدورة زراعية واحدة على الأقل لمقارنتها بميزانيتك.',
  language:'Language|اللغة',
  skip:'Skip to content|انتقل إلى المحتوى',
  fieldLabel:'Field|الحقل',
  demoTomato:'Tomatoes|طماطم',
  demoZucchini:'Zucchini|كوسا',
  overviewPhoto:'Explore the satellite map|استكشف خريطة الأقمار الصناعية',
  overviewIntro:'Check soil moisture and surface heat before planning irrigation or the next crop.|تحقق من رطوبة التربة وحرارة السطح قبل التخطيط للري أو اختيار المحصول التالي.',
  demo:'Explore demo|استكشف العرض',
  demoField:'Umm Al Quwain example|مثال أم القيوين',
  demoNotice:'Example field with recorded bench readings and sample rotation inputs.|حقل نموذجي يعرض قراءات من اختبار الفريق ومدخلات توضيحية للدورة الزراعية.',
  useMine:'Use my field|استخدم حقلي',
  ownField:'Choose a country and drop a pin to start. You can add crops, sensors and thresholds later.|اختر بلدك وحدد موقع الحقل على الخريطة. يمكنك إضافة المحاصيل والمستشعرات والحدود لاحقًا.',
  optional:'Optional farm details|بيانات زراعية اختيارية',
  fieldDefault:'My field|حقلي',
  unknownCrop:'Skip for now|تخطي الآن',
  bench:'Recorded bench test|اختبار مخبري مسجل',
  snapshotWeather:'NASA POWER observation · 11 November 2026 (UTC)|بيانات NASA POWER · ١١ نوفمبر ٢٠٢٦ (بالتوقيت العالمي)',
  mapDemo:'Map imagery for the example location. Layer availability depends on the date and coverage.|صور خرائط للموقع النموذجي. تعتمد الطبقات على التغطية والتاريخ.',
  demoRotation:'Example water inputs. Change them to see how the comparison works.|مدخلات مياه توضيحية. غيّرها لتجربة المقارنة.',
  demoDevice:'Explore the recorded readings below. Save your own field to pair a device or import a CSV.|استعرض القراءات المسجلة أدناه. احفظ حقلك لربط جهاز أو استيراد ملف.',
  absent:'Connect a probe or import readings to track soil moisture, salinity and irrigation. Weather and maps use your field location.|اربط مستشعرًا أو استورد قراءات لمتابعة رطوبة التربة والملوحة والري. تستند الخرائط وبيانات الطقس إلى موقع حقلك.',
  estimatedArea:'Estimated field area|مساحة الحقل التقديرية',
  areaNeeded:'Draw a boundary to calculate the approximate field area.|ارسم الحدود لحساب المساحة التقريبية.',
  waterReference:'Five-day reference water demand|الاحتياج المائي المرجعي لخمسة أيام',
  waterReferenceNote:'Based on forecast ET₀ for reference grass. Crop demand varies with the crop and growth stage. Irrigation also depends on rainfall, soil storage and system efficiency.|يعتمد على البخر والنتح المرجعي ET₀. يتغير احتياج المحصول حسب نوعه ومرحلة نموه، ويعتمد الري أيضاً على المطر ومخزون التربة وكفاءة النظام.',
  forecastRange:'Approximate reference volume|الحجم المرجعي التقريبي',
  noBudget:'Enter a seasonal water budget to see which options fit.|أدخل ميزانية المياه الموسمية لمعرفة الخيارات الملائمة.',
  accountRequired:'Create an account to save your field and return to it later.|أنشئ حساباً لحفظ حقلك والعودة إليه لاحقاً.',
  continueSetup:'Continue|متابعة',
  backToField:'Edit field location|تعديل موقع الحقل',
  draftSaveFailed:'Signed in. Review the field details and try saving again.|تم تسجيل الدخول. راجع بيانات الحقل وحاول الحفظ مرة أخرى.',
  planReference:'See the five-day forecast in Field overview. Seasonal water use depends on your crop, growing season and irrigation system.|راجع مرجع الطقس لخمسة أيام في نظرة عامة على الحقل. تعتمد تقديرات المياه الموسمية على المحصول والموسم ونظام الري.',
  archiveDelay:'The latest numeric SMAP sample available here is older than seven days. See the dated map and catalogue for more recent observations.|أحدث قيمة رقمية من SMAP أقدم من سبعة أيام. راجع الخريطة والفهرس المؤرخين للمشاهدات الأحدث.',
  smapDemo:'Regional SMAP catalogue match · 12 November 2026|نتيجة إقليمية في فهرس SMAP · ١٢ نوفمبر ٢٠٢٦',
  openModis:'Show MODIS surface heat|اعرض حرارة السطح من MODIS',
  openThermalExample:'See ECOSTRESS temperatures in Los Angeles|اطّلع على درجات الحرارة من ECOSTRESS في لوس أنجلوس',
  thermalFallback:'View regional surface temperatures on the 1 km MODIS map.|اطّلع على حرارة السطح في المنطقة على خريطة MODIS بدقة كيلومتر واحد.',
  modisArchive:'NASA MODIS regional surface heat · 12 November 2026. Transparent areas in the overlay have no usable measurement for that date.|حرارة سطح المنطقة من MODIS · ١٢ نوفمبر ٢٠٢٦. المناطق الشفافة في الطبقة تفتقر إلى قياس صالح لهذا اليوم.',
  heatDemo:'ECOSTRESS scene in the catalogue · 31 October 2026|مشهد في فهرس ECOSTRESS · ٣١ أكتوبر ٢٠٢٦',
  sourceSnapshot:'NASA observations and sources|مشاهدات ناسا ومصادرها'
});
const langs=['en','ar'];let lang=langs.includes(localStorage.getItem('pump-lang'))?localStorage.getItem('pump-lang'):'en';
const t=key=>labels[key]?.split('|')[langs.indexOf(lang)]??key;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(key)=>esc(t(key));
const displayTime=value=>value?new Intl.DateTimeFormat(lang,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
const dataPath=(field,tail)=>'/api/fields/'+field.id+'/'+tail;
const exampleField={id:'demo',name:'',country:'AE',lat:25.54,lon:55.59,polygon:[],previous:['Tomato','Zucchini'],plan:{priority:'water',budget:500,base:480,legume:430,mixed:360}};
const exampleReadings=[3577,3602,3612].map((raw,index)=>({label:'ESP32',device:'demo',origin:'bench',raw_adc:raw,wetness_index:[17.7,16.8,16.5][index]}));
const isDemo=()=>field?.id==='demo';
let account=null,fields=[],field=exampleField, readings=exampleReadings, authMode='login', authOpen=false, pendingField=null, map=null, fieldMap=null, timer, dataset=null;
let currentSources={}, tokenMessage='',planInputs={};
const pages=['overview','moisture','salinity','heat','map','rotation','learn','sensors','sources'];
const mapLinks={heat:'thermal',moisture:'smap',ecostress:'ecostress'};
const glyph={overview:'⌂',moisture:'≈',salinity:'◇',heat:'☀',map:'◎',rotation:'↻',sensors:'⌁',sources:'≡',learn:'▤'};
const countryNames=()=>new Intl.DisplayNames([lang],{type:'region'});
const countryCodes='AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW'.split(' ');
const countryLabel=code=>countryNames().of(code)??code;
const opts=(items,selected)=>items.map(([v,k])=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+text(k)+'</option>').join('');
const countries=selected=>countryCodes.map(code=>[code,countryLabel(code)]).sort((a,b)=>a[1].localeCompare(b[1],lang)).map(([v,k])=>'<option value="'+v+'"'+(v===selected?' selected':'')+'>'+esc(k)+'</option>').join('');
const btn=(key,attrs='',primary=false)=>'<button type="button" class="'+(primary?'primary':'small-button')+'" '+attrs+'>'+text(key)+'</button>';
const p=(key,cls='sub')=>'<p class="'+cls+'">'+text(key)+'</p>';
const attr=(key,value)=>value==null?'':key+'="'+esc(value)+'"';
const card=(key,inner,cls='')=>'<section class="panel card '+cls+'"><h2>'+text(key)+'</h2>'+inner+'</section>';
const notice=key=>'<p class="notice">'+text(key)+'</p>';
function setLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';localStorage.setItem('pump-lang',lang);}
function languages(){return '<label><select id="language" aria-label="'+text('language')+'">'+opts([['en','English'],['ar','العربية']],lang)+'</select></label>';}
function brand(){return '<a class="brand" href="#overview"><img src="/mark.svg" alt=""><span>Falaj Fields<small>'+text('tag')+'</small></span></a>';}
function heading(key,desc='',action=''){return '<div class="intro"><div><p class="eyebrow">'+(isDemo()?text('regionalDemo'):esc(field?countryLabel(field.country):'Falaj Fields'))+'</p><h1>'+text(key)+'</h1>'+(desc?p(desc):'')+'</div>'+action+'</div>';}
async function api(url,method='GET',body){
  const response=await fetch(url,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const payload=await response.json();
  if(!response.ok)throw Error(payload.error??'serverError');
  return payload;
}
function formStatus(form,key,error=false){const node=form.querySelector('[role=status]');if(node){node.textContent=t(key);node.classList.toggle('error',error);}}
function route(){
  const name=location.hash.slice(1).split('/')[0];
  return pages.includes(name)?name:'overview';
}
function resetLive(){readings=isDemo()?exampleReadings:[];currentSources={};tokenMessage='';}
function setField(id){
  field=id==='demo'?exampleField:fields.find(item=>item.id===id)??fields[0]??exampleField;
  resetLive();
  if(account)localStorage.setItem('pump-last-field-'+account.id,field.id);
  render();
}
function authPage(){
  const register=authMode==='register';
  return '<div class="auth-shell"><section class="auth-intro">'+brand()+'<h1>Falaj<br>Fields.</h1>'+p('welcome')+btn('demo','data-return-demo',true)+'<a class="text-action" href="/showcase.html">'+text('publicGuides')+' ↗</a></section><section class="auth-form"><div class="top-actions">'+btn(register?'signIn':'register','data-auth-toggle')+languages()+'</div><h2>'+text(register?'register':'signIn')+'</h2>'+(pendingField?p('accountRequired')+btn('backToField','data-back-field'):'')+'<form id="authForm"><label>'+text('email')+'<input required type="email" name="email" autocomplete="email" maxlength="254"></label><label>'+text('password')+'<input required type="password" name="password" minlength="12" maxlength="128" autocomplete="'+(register?'new-password':'current-password')+'"></label><button class="primary" type="submit">'+text(register?'register':'signIn')+'</button><p class="status" role="status"></p></form></section></div>';
}
function render(){
  clearInterval(timer);if(map){map.remove();map=null;}setLanguage();
  if(authOpen&&!account){root.innerHTML=authPage();return;}
  const page=route();
  const authActions=account?btn('signout','data-signout'):btn('signIn','data-sign-in');
  const fieldOptions='<option value="demo"'+(isDemo()?' selected':'')+'>'+text('demoField')+'</option>'+fields.map(f=>'<option value="'+esc(f.id)+'"'+(field.id===f.id?' selected':'')+'>'+esc(f.name)+'</option>').join('');
  root.innerHTML='<a class="skip" href="#main" data-skip>'+text('skip')+'</a><div class="shell"><aside class="sidebar">'+brand()+'<nav aria-label="Falaj Fields" class="workspace-nav">'+pages.map(key=>'<a href="#'+key+'"'+(page===key?' aria-current="page"':'')+'><span class="nav-icon" aria-hidden="true">'+glyph[key]+'</span>'+text(key==='heat'?'heatStress':key)+'</a>').join('')+'</nav><div class="sidebar-bottom">'+(account?'<small class="meta">'+esc(account.email)+'</small>':'')+authActions+'</div></aside><div class="workspace"><header class="top workspace-top"><label class="workspace-field"><span>'+text('fieldLabel')+'</span><select id="fieldPicker" aria-label="'+text('selectField')+'">'+fieldOptions+'</select></label>'+languages()+'<div class="field-actions">'+btn(isDemo()?'useMine':'add','data-field-new',true)+(isDemo()?'':btn('edit','data-field-edit'))+'<span class="mobile-account">'+authActions+'</span></div></header><main id="main" tabindex="-1">'+(isDemo()?notice('demoNotice'):'')+({overview,moisture:moisturePage,salinity:salinityPage,heat:heatPage,map:mapPage,rotation,sensors,sources,learn})[page]()+'</main><footer><span>Falaj Fields</span><span>NASA Space Apps · Field Shift · Umm Al Quwain</span><a class="text-action" href="/showcase.html">'+text('publicGuides')+' ↗</a></footer></div></div>';
  if(page==='map')initMap();
  if(isDemo()&&page==='sources')loadDemoSmap();
  if(!isDemo()&&['overview','moisture','salinity','sensors'].includes(page)){refreshReadings();timer=setInterval(refreshReadings,6000);}
  if(page==='overview'&&!isDemo()){loadEarth('power','power');loadForecast();}
  if(page==='rotation')updatePlan();
  if(page==='sensors'&&!isDemo())loadDevices();
  if(page==='sources'&&!isDemo())loadCatalog();
  if(page==='moisture'&&isDemo())loadDemoSmap();
  if(page==='moisture'&&!isDemo())loadEarth('smap','moistureContext');
  if(page==='heat'&&!isDemo()){loadThermal('cropHeat',false);loadForecast();}
  if(page==='learn'&&!isDemo())loadCoverContext();
}
function metric(key,value,unit=''){return '<div class="panel metric"><div><small>'+text(key)+'</small><strong dir="ltr">'+(value==null?'—':esc(value)+' '+esc(unit))+'</strong></div></div>';}
function fieldWarning(state, message, advice=''){
  const warning=['low','high','watch'].includes(state);
  return '<div class="field-warning '+(warning?'is-warning':'')+'"><span class="warning-icon" aria-hidden="true">'+(warning?'⚠':'•')+'</span><div><strong>'+text(message)+'</strong>'+(advice?p(advice,'status'):'')+'</div></div>';
}
function measurementPanel(kind,compact=false){
  if(isDemo()){
    return fieldWarning('info',kind==='moisture'?'moistureDemo':'saltDemo')+
      (compact?'':'<div class="tools">'+btn('useMine','data-field-new',true)+'</div>');
  }
  const soil=kind==='salinity';
  const result=fieldEstimates.measurementStatus(readings,soil?'soil_ec_dsm':'moisture_pct',soil?null:field.dry,soil?field.soilEcLimit:field.wet);
  const titles=soil?{missing:'saltMissing',old:'olderReading',limits:'saltSetup',high:'soilSaltHigh',within:'inRange'}:{missing:'moistureMissing',old:'olderReading',limits:'moistureSetup',low:'tooDry',high:'tooWet',within:'inRange'};
  const next={soilSaltHigh:'saltNext',tooDry:'dryNext',tooWet:'wetNext'};
  const title=titles[result.state];
  let body=fieldWarning(result.state,title,next[title]);
  if(result.value!=null)body+='<div class="measurement-value"><strong dir="ltr">'+esc(result.value)+(soil?' dS/m':'%')+'</strong><span>'+esc(displayTime(result.timestamp))+(result.origin==='csv'?' · '+text('manual'):'')+'</span></div>';
  if(!soil&&result.value==null&&readings.some(row=>row.wetness_index!=null))body+=p('relativeOnly','status');
  if(!soil&&Number.isFinite(field.eventLimit)&&Number.isFinite(field.wet)){
    const event=readings.find(row=>Number.isFinite(row.litres));
    if(event&&Number.isFinite(event.moisture_pct)&&event.moisture_pct>field.wet&&fieldEstimates.measurementStatus([event],'litres',null,field.eventLimit).state==='high'){
      body+=fieldWarning('high','tooMuchWater','volumeAction');
    }
  }
  if(soil&&field.ece!=null){
    const high=field.labEcLimit!=null&&field.ece>field.labEcLimit;
    body+='<div class="measurement-value"><span>'+text('labSalt')+'</span><strong dir="ltr">'+esc(field.ece)+' dS/m</strong></div>';
    if(high)body+=fieldWarning('high','labHigh','saltNext');
  }
  if(soil){
    const water=fieldEstimates.measurementStatus(readings,'ecw_dsm',null,field.maxEc);
    if(water.value!=null){
      body+='<div class="measurement-value"><span>'+text('waterSalt')+'</span><strong dir="ltr">'+esc(water.value)+' dS/m</strong><span>'+esc(displayTime(water.timestamp))+'</span></div>';
      if(water.state==='high')body+=fieldWarning('high','waterSaltHigh','saltNext');
    }
  }
  if(result.state==='limits')body+=btn('thresholds','data-field-edit data-open-limits');
  if(result.state==='missing'||result.state==='old')body+='<a href="#sensors">'+text('sensors')+' ↗</a>';
  return body;
}
function conditionGrid(){
  return '<div class="condition-grid"><section class="panel card"><h2><a href="#moisture">'+text('moisture')+'</a></h2><div data-check="moisture">'+measurementPanel('moisture',true)+'</div></section>'+
    '<section class="panel card"><h2><a href="#salinity">'+text('salinity')+'</a></h2><div data-check="salinity">'+measurementPanel('salinity',true)+'</div></section>'+
    '<section class="panel card"><h2><a href="#heat">'+text('heatStress')+'</a></h2>'+p('heatIntro')+'<a href="#heat">'+text('heatStress')+' ↗</a></section></div>';
}
function moisturePage(){
  const context=isDemo()?'<div id="demoSmap">'+p('loading')+'</div>':'<div id="moistureContext">'+p('loading')+'</div>';
  return heading('moisture','moistureIntro')+card('fieldCheck','<div data-check="moisture">'+measurementPanel('moisture')+'</div>')+
    '<div class="section-stack">'+card('regionalMoisture',context+'<a href="#map/moisture">'+text('smapMap')+' ↗</a>')+'</div>';
}
function salinityPage(){
  return heading('salinity','saltIntro')+card('fieldCheck','<div data-check="salinity">'+measurementPanel('salinity')+'</div>')+
    '<div class="section-stack">'+card('saltContext',p('saltMethod')+'<a href="#map/moisture">'+text('regionalMoisture')+' ↗</a><br><a href="https://www.fao.org/docrep/pdf/010/a0975e/a0975e00.pdf">'+text('saltGuide')+' ↗</a>')+'</div>';
}
function heatPage(){
  const thermal=isDemo()?p('modisArchive')+thermalLinks()+p('heatDemo','status'):'<div id="cropHeat">'+p('loading')+'</div>';
  return heading('heatStress','heatIntro')+card('surfaceHeat',thermal)+'<div class="section-stack">'+card('heatActions',p('heatNext')+'<a href="#learn">'+text('coverGuide')+' ↗</a>')+
    (isDemo()?'':card('forecast','<div id="forecast">'+p('loading')+'</div>'))+'</div>';
}
function overview(){
  if(isDemo())return '<div class="overview-hero">'+heading('overview','overviewIntro','<div class="intro-actions"><a class="primary" href="#rotation">'+text('rotation')+'</a><a class="small-button" href="#map">'+text('overviewPhoto')+'</a></div>')+'<img src="/media/date-palm-landscape.webp" width="1280" height="720" alt="" fetchpriority="high"></div>'+conditionGrid()+card('power',p('snapshotWeather')+'<strong class="reference-number" dir="ltr">31.38 °C</strong><a href="/showcase.html#earth-evidence">'+text('sourceSnapshot')+' ↗</a>');
  const area=fieldEstimates.areaM2(field.polygon);
  const areaCard=card('estimatedArea',area==null?p('areaNeeded'):'<strong class="reference-number" dir="ltr">'+(area/10000).toLocaleString(lang,{maximumSignificantDigits:3})+' ha</strong>');
  const focus=field.country==='AE'?'uaFocus':field.country==='AU'?'auFocus':'genericFocus';
  return heading('overview',focus,'<a class="primary" href="#rotation">'+text('rotation')+' ↗</a>')+
    conditionGrid()+

    '<div class="split section-stack">'+card('forecast','<div id="forecast">'+p('loading')+'</div>')+card('power','<div id="power">'+p('loading')+'</div>')+'</div><div class="section-stack">'+areaCard+'</div>';
}
let browserForecast;
async function forecastFromBrowser(f){
  const key=f.lat+':'+f.lon;
  if(browserForecast?.key===key&&Date.now()<browserForecast.until)return browserForecast.result;
  const url=new URL('https://api.open-meteo.com/v1/forecast');
  const daily=['temperature_2m_max','precipitation_sum','et0_fao_evapotranspiration'];
  url.search=new URLSearchParams({latitude:f.lat,longitude:f.lon,daily:daily.join(','),timezone:'auto',forecast_days:5});
  const result=(async()=>{
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(8000)});
      if(!response.ok)return null;
      const data=(await response.json()).daily;
      if(!Array.isArray(data?.time))return null;
      const rows=data.time.map((date,index)=>({date,values:daily.map(metric=>{
        const value=data[metric]?.[index];
        return Number.isFinite(value)&&value!==-999?value:null;
      })}));
      return rows.some(row=>row.values.some(value=>value!==null))?{rows}:null;
    }catch{return null;}
  })();
  browserForecast={key,until:Date.now()+5*60000,result};
  return result;
}
async function loadForecast(){
  const node=document.getElementById('forecast'),f=field;
  if(!node||!f)return;
  try{
    let response=await api(dataPath(f,'earth/forecast'));
    if(!node.isConnected||field?.id!==f.id)return;
    if(response.unavailable||response.stale)response=await forecastFromBrowser(f)??response;
    if(!node.isConnected||field?.id!==f.id)return;
    if(response.unavailable||!response.rows?.length){node.innerHTML=notice('unavailable');return;}
    const table='<div class="data-table" tabindex="0"><table><thead><tr><th>'+text('day')+'</th><th>°C</th><th>'+text('rain')+' (mm)</th><th>ET₀ (mm)</th></tr></thead><tbody>'+
      response.rows.map(row=>'<tr><td>'+esc(row.date)+'</td>'+row.values.map(value=>'<td>'+esc(value??'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
    const heatAlert=!response.stale&&f.heat!=null&&response.rows.some(row=>row.values[0]!=null&&row.values[0]>=f.heat);
    const reference=response.stale?null:fieldEstimates.weatherReference(response.rows,fieldEstimates.areaM2(f.polygon));
    const amount=value=>value.toLocaleString(lang,{maximumSignificantDigits:3});
    const referenceCard=reference?'<div class="reference-box"><h3>'+text('waterReference')+'</h3><strong dir="ltr">'+amount(reference.mm)+' mm</strong>'+(reference.litres==null?'':'<p>'+text('forecastRange')+' · <b dir="ltr">'+amount(reference.litres)+' L</b></p>')+p('waterReferenceNote','status')+'<a href="https://open-meteo.com/en/docs">'+text('sourceLabel')+' · Open-Meteo ↗</a></div>':'';
    node.innerHTML=(response.stale?notice('forecastStale'):heatAlert?fieldWarning('watch','heatWatch','heatNext'):'')+
      '<details><summary>'+text('forecastDetails')+'</summary>'+referenceCard+p('forecastNote')+table+'</details>';
  }catch{if(node.isConnected)node.innerHTML=notice('unavailable');}
}
async function refreshReadings(){
  const f=field;
  if(!f)return;
  try{
    const response=await api(dataPath(f,'readings'));
    if(field?.id!==f.id)return;
    readings=response;
    for(const panel of document.querySelectorAll('[data-check]')){
      const next=measurementPanel(panel.dataset.check);
      if(panel.lastMarkup!==next){panel.innerHTML=next;panel.lastMarkup=next;}
    }
    const sensor=document.querySelector('#readingRows');if(sensor)sensor.innerHTML=readingTable();
  }catch{if(field?.id===f.id)for(const node of document.querySelectorAll('[data-check],#readingRows'))node.innerHTML=notice('unavailable');}
}
function chart(values){
  const finite=values.filter(Number.isFinite);
  if(finite.length<2)return '';
  const min=Math.min(...finite),max=Math.max(...finite),span=max-min||1;
  let previous=false;
  const points=values.map((n,i)=>{
    if(!Number.isFinite(n)){previous=false;return '';}
    const point=(previous?'L':'M')+(5+i/(values.length-1)*290).toFixed(1)+' '+(88-(n-min)/span*77).toFixed(1);
    previous=true;return point;
  }).join(' ');
  return '<div class="line-chart"><svg viewBox="0 0 300 100" role="img" aria-label="'+text('chart')+'"><path d="'+points+'" stroke="#53816a" fill="none" stroke-width="2.8"/></svg></div>';
}
const earthUnits={T2M_MAX:'°C',RH2M:'%',PRECTOTCORR:'mm/day',ALLSKY_SFC_SW_DWN:'kWh/m²/day',SFMC_SMAP:'m³/m³',RZMC_SMAP:'m³/m³',SFMC:'m³/m³',RZMC:'m³/m³'};
function earthSeries(kind,result){
  const series=result.rows, index=kind==='power'?result.keys.indexOf('T2M_MAX'):result.keys.findIndex(key=>key.startsWith('SFMC'));
  const latest=series.at(-1);
  const valueLabels={T2M_MAX:'maxAir',RH2M:'rh',PRECTOTCORR:'rain',ALLSKY_SFC_SW_DWN:'sw'};
  const keyLabel=key=>key.startsWith('SFMC')?'surface':key.startsWith('RZMC')?'rootMoist':valueLabels[key]??key;
  const mean=rows=>{const values=rows.map(r=>r.values[index]).filter(Number.isFinite);return values.length>=4?values.reduce((a,b)=>a+b,0)/values.length:null;};
  const recent=mean(series.slice(-7)),past=mean(series.slice(-21,-7));
  const drying=kind==='smap'&&!result.stale&&!result.archived&&recent!==null&&past!==null&&recent<=past-.03;

  return (kind==='smap'?p('regional'):'')+(result.archived?notice('archiveDelay'):'')+(drying?fieldWarning('watch','dryWatch'):'')+'<p class="status">'+text('observed')+' <bdi>'+esc(result.observation)+'</bdi>'+(result.checkedAt?' · '+text('lastCheck')+' '+esc(displayTime(result.checkedAt)):'')+(result.stale?' · '+text('cached'):'')+'</p>'+chart(series.map(row=>row.values[index]))+'<ul class="data-list">'+result.keys.map((key,i)=>'<li><span>'+text(keyLabel(key))+'</span><b dir="ltr">'+(latest.values[i]==null?'—':esc(latest.values[i])+' '+esc(earthUnits[key]??''))+'</b></li>').join('')+'</ul>';
}
async function loadEarth(kind,target){
  const panel=document.getElementById(target),f=field;if(!panel||!f)return;
  panel.innerHTML=p('loading');
  try{
    const data=currentSources[kind]??await api(dataPath(f,'earth/'+kind));
    if(field?.id!==f.id||!panel.isConnected)return;
    if(!data.unavailable)currentSources[kind]=data;
    if(data.unavailable){panel.innerHTML=notice('unavailable');return;}
    if(!data.rows?.length){panel.innerHTML=notice('empty');return;}
    if(kind==='smap'||kind==='power')panel.innerHTML=earthSeries(kind,data);
    else panel.innerHTML='<p class="status">'+text('lastCheck')+' '+esc(displayTime(data.checkedAt))+(data.stale?' · '+text('cached'):'')+'</p><ul class="data-list">'+data.rows.map(row=>'<li><a rel="noopener" target="_blank" href="'+esc(row.url)+'">'+esc(row.title)+' ↗</a><span>'+esc(row.time?.slice(0,10))+'</span></li>').join('')+'</ul>';
  }catch{if(panel.isConnected)panel.innerHTML=notice('unavailable');}
}
const tileAttribution='Tiles © Esri, Maxar, Earthstar Geographics and the GIS User Community';
const satelliteUrl='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const layers={
 base:['imagery',null,0],
 ecostress:['ECOSTRESS LST · 70 m',null,0],
 smap:['SMAP · 9 km','SMAP_L2_Passive_Enhanced_Day_Soil_Moisture_Option3',3],
 landsat:['Landsat HLS · 30 m','HLS_L30_Nadir_BRDF_Adjusted_Reflectance',7],
 sentinel:['Sentinel-2 HLS · 30 m','HLS_S30_Nadir_BRDF_Adjusted_Reflectance',7],
 modis:['MODIS NDVI','MODIS_Terra_NDVI_8Day',12],
 viirs:['VIIRS','VIIRS_SNPP_CorrectedReflectance_TrueColor',1],
 thermal:['MODIS surface temperature','MODIS_Terra_Land_Surface_Temp_Day',3]
};
const earlier=days=>new Date(Date.now()-days*86400000).toISOString().slice(0,10);
function mapPage(){
  const google='https://earth.google.com/web/@'+field.lat+','+field.lon+',3000a';
  return heading('map')+'<section class="panel"><div class="map-controls"><label>'+text('layer')+'<select id="mapLayer">'+opts(Object.entries(layers).map(([key,item])=>[key,item[0]]),'base')+'</select></label><label>'+text('day')+'<input id="mapDate" type="date" value="'+earlier(3)+'" max="'+earlier(0)+'"></label>'+btn('apply','data-map-apply')+'<a class="text-action" href="'+esc(google)+'" rel="noopener noreferrer" target="_blank">'+text('earthView')+' ↗</a></div><div id="satelliteMap" class="large-map" dir="ltr"></div><div id="tileStatus" class="meta tile-status" role="status">'+text('coverage')+'</div></section>'+(isDemo()?'<p class="status">'+text('mapDemo')+'</p><a class="text-action" href="/showcase.html#earth-evidence">'+text('sourceSnapshot')+' ↗</a>':'<div class="split section-stack">'+card('ECOSTRESS LST · 70 m',p('granuleInfo')+'<div id="heatScenes"></div>'+btn('load','data-earth="ecostress" data-target="heatScenes"'))+card('ECOSTRESS ET · 70 m',p('granuleInfo')+'<div id="etScenes"></div>'+btn('load','data-earth="et" data-target="etScenes"'))+'</div>');
}
function baseMap(id,center,zoom){
  if(!window.L)return null;
  const result=L.map(id,{worldCopyJump:true}).setView(center,zoom);
  const tiles=L.tileLayer(satelliteUrl,{attribution:tileAttribution,maxNativeZoom:18,maxZoom:20});
  tiles.once('tileerror',()=>{if(result.hasLayer(tiles)){
    result.removeLayer(tiles);
    L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(result);
  }});
  tiles.addTo(result);
  return result;
}
let overlay=null;
function initMap(){
  map=baseMap('satelliteMap',[field.lat,field.lon],14);overlay=null;
  if(!map){document.querySelector('#tileStatus').textContent=t('unavailable');return;}
  L.circleMarker([field.lat,field.lon],{radius:7,color:'#fff',weight:2,fillColor:'#253b2b',fillOpacity:1}).addTo(map).bindTooltip(()=>document.createTextNode(isDemo()?t('demoField'):field.name));
  if(field.polygon.length){
    const area=L.polygon(field.polygon,{color:'#e2edb1',weight:3}).addTo(map);
    map.fitBounds(area.getBounds(),{padding:[24,24],maxZoom:17});
  }
  if(!isDemo())loadEarth('ecostress','heatScenes');
  const link=location.hash.split('/')[1];
  const linkedLayer=Object.hasOwn(mapLinks,link)?mapLinks[link]:null;
  if(linkedLayer)showMapLayer(linkedLayer);
}
function showMapLayer(layer){
  document.querySelector('#mapLayer').value=layer;
  document.querySelector('#mapDate').value=isDemo()?'2026-11-12':earlier(layers[layer][2]);
  setOverlay();
}
function thermalLinks(){
  return p('thermalFallback','status')+'<div class="tools"><a class="text-action" href="#map/heat">'+text('openModis')+' ↗</a><a class="text-action" href="/showcase.html#ecostress-example">'+text('openThermalExample')+' ↗</a></div>';
}
function setOverlay(){
  if(!map)return;
  if(overlay)map.removeLayer(overlay);
  overlay=null;
  const key=document.querySelector('#mapLayer').value, date=document.querySelector('#mapDate').value, status=document.querySelector('#tileStatus');
  status.textContent=t('coverage');
  if(key==='ecostress'){
    if(isDemo())status.innerHTML=thermalLinks();
    else loadThermal('tileStatus',true);
    return;
  }
  if(key==='base'||!date)return;
  if(isDemo()&&key==='thermal'&&date==='2026-11-12'){
    overlay=L.imageOverlay('/media/umm-al-quwain-modis-2026-11-12.png',[[25.22,55.11],[25.85,56.05]],{opacity:.72,attribution:'NASA Earthdata GIBS'}).addTo(map);
    status.textContent=t('modisArchive');
    return;
  }
  const layer=layers[key][1];
  overlay=L.tileLayer.wms('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',{
    layers:layer,format:'image/png',transparent:true,version:'1.1.1',time:date,opacity:.72,attribution:'NASA Earthdata GIBS',maxZoom:20,maxNativeZoom:key==='smap'?6:12
  }).on('tileerror',()=>{if(status.isConnected)status.textContent=t('unavailable')+' '+t('coverage');}).addTo(map);
}
async function loadThermal(target,draw){
  const node=document.getElementById(target), f=field;
  if(!node||!f)return;
  node.innerHTML=p('loading');
  try{
    const result=await api(dataPath(f,'earth/thermal'));
    if(!node.isConnected||field?.id!==f.id||(draw&&document.querySelector('#mapLayer')?.value!=='ecostress'))return;
    if(result.configurationRequired){node.innerHTML=p('thermalUnavailable')+thermalLinks();return;}
    if(result.unavailable||!result.points?.length){node.innerHTML=p('unavailable')+thermalLinks();return;}
    const signal=fieldEstimates.thermalSignal(result,f.surfaceHeat);
    if(!signal){node.innerHTML=p('unavailable')+thermalLinks();return;}
    const {min,max}=signal;
    const advice=signal.fresh&&signal.hot>0?fieldWarning('watch','satelliteHeatWatch','heatNext'):(!signal.fresh?p('oldHeat','status'):signal.hot==null?p('heatLimitHelp','status')+btn('thresholds','data-field-edit data-open-limits'):'');
    const match=signal.hot>0?'<p class="status"><bdi>'+signal.hot+'/'+signal.count+'</bdi> '+text('hotPixels')+'</p>':'';
    node.innerHTML='<strong dir="ltr">'+min+'–'+max+' °C</strong><p>'+esc(displayTime(result.observation))+' · '+esc(result.granule)+' · '+result.points.length+'/'+result.sampled+'</p>'+p('thermalLegend')+(draw?'':'<a href="#map/ecostress">'+text('openFieldHeat')+' ↗</a>')+(result.stale?p('cached'):'')+advice+match;
    if(draw&&map){
      overlay=L.layerGroup(result.points.map(pt=>{
        const frac=(pt.celsius-min)/(max-min||1),color=signal.fresh&&f.surfaceHeat!=null?(pt.celsius>=f.surfaceHeat?'#a83b24':'#397660'):'hsl('+(68-frac*55)+',72%,'+(48-frac*9)+'%)';
        return L.circleMarker([pt.lat,pt.lon],{radius:5,weight:0,fillColor:color,fillOpacity:.85}).bindTooltip(pt.celsius+' °C');
      })).addTo(map);
    }
  }catch{if(node.isConnected)node.innerHTML=p('thermalUnavailable')+thermalLinks();}
}
function readingTable(){
  if(!readings.length)return notice('waiting');
  const indexMode=readings[0].moisture_pct==null&&readings[0].wetness_index!=null;
  const metricKey=indexMode?'wetness_index':'moisture_pct';
  return (indexMode?p('probeIndexNote','status'):'')+chart(readings.filter(row=>row.device===readings[0].device).slice(0,35).reverse().map(row=>row[metricKey]))+'<div class="data-table" tabindex="0"><table><thead><tr>'+['device','observed','received','moisture','probeIndex','rawAdc','soilEC','ec','volume','soilTemp'].map(key=>'<th>'+text(key)+'</th>').join('')+'</tr></thead><tbody>'+readings.slice(0,40).map(r=>'<tr>'+[r.label+' · '+(r.origin==='bench'?t('bench'):r.origin==='csv'?t('manual'):'Arduino'),displayTime(r.timestamp),displayTime(r.received),r.moisture_pct==null?'—':r.moisture_pct+'%',r.wetness_index??'—',r.raw_adc??'—',r.soil_ec_dsm==null?'—':r.soil_ec_dsm+' dS/m',r.ecw_dsm==null?'—':r.ecw_dsm+' dS/m',r.litres==null?'—':r.litres+' L',r.soil_temp_c==null?'—':r.soil_temp_c+' °C'].map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function sensors(){
  if(isDemo())return heading('sensors','demoDevice')+card('bench',readingTable()+'<a class="text-action" href="/soil-lab.html">'+text('soilLab')+' ↗</a>');
  return heading('sensors')+'<div class="split">'+card('pair','<form id="pairForm" class="form-stack"><label>'+text('device')+'<input name="label" required maxlength="65"></label><button class="primary" type="submit">'+text('pair')+'</button><p class="status" role="status"></p></form><div id="deviceToken">'+tokenMessage+'</div><ul class="data-list" id="devices"></ul>')+card('import',p('csvHelp')+'<form id="csvForm" class="form-stack"><input type="file" required accept=".csv,text/csv" name="file" aria-label="'+text('import')+'"><button class="small-button" type="submit">'+text('import')+'</button><p class="status" role="status"></p></form><p class="meta">'+text('ece')+' · '+esc(field.ece??'—')+'</p>')+'</div><div class="section-stack">'+card('snapshot','<div id="readingRows">'+readingTable()+'</div><a class="text-action" href="/soil-lab.html">'+text('soilLab')+' ↗</a>')+'</div>';
}
async function loadDevices(){
  const node=document.querySelector('#devices'),f=field;if(!node||!f)return;
  try{
    const devices=await api(dataPath(f,'devices'));
    node.innerHTML=devices.filter(d=>!d.id.startsWith('csv-')).map(d=>'<li><span>'+esc(d.label)+'</span>'+btn('rotate','data-rotate="'+esc(d.id)+'"')+'</li>').join('');
  }catch{node.innerHTML='<li>'+text('unavailable')+'</li>';}
}
function showToken(token){
  tokenMessage=p('pairBody')+'<code class="token" dir="ltr">'+esc(token)+'</code><code class="token" dir="ltr">POST '+esc(location.origin)+'/api/telemetry</code>';
  const node=document.querySelector('#deviceToken');if(node)node.innerHTML=tokenMessage;
}
function parseCsv(csv){
  const [header,...rows]=csv.trim().replace(/^\uFEFF/,'').split(/\r?\n/).filter(line=>line.trim());
  const keys=header?.split(',').map(x=>x.trim())??[];
  const allowed=['timestamp','moisture_pct','ecw_dsm','soil_ec_dsm','litres','soil_temp_c','raw_adc','probe_calibration'];
  if(!keys.includes('timestamp')||new Set(keys).size!==keys.length||keys.some(key=>!allowed.includes(key))||!rows.length||rows.length>500)throw Error('reading');
  return rows.map(row=>{
    const values=row.split(',').map(x=>x.trim().replace(/^"|"$/g,''));
    if(values.length!==keys.length)throw Error('reading');
    return Object.fromEntries(keys.map((k,i)=>{
      const value=values[i];
      if(k==='timestamp'||k==='probe_calibration')return [k,value||null];
      if(value&&!Number.isFinite(Number(value)))throw Error('reading');
      return [k,value?Number(value):null];
    }));
  });
}
let demoSmap;
async function loadDemoSmap(){
  const target=document.querySelector('#demoSmap');
  if(!target)return;
  try{
    demoSmap??=await api('/media/umm-al-quwain-smap.json');
    if(target.isConnected)target.innerHTML=earthSeries('smap',{...demoSmap,archived:true});
  }catch{if(target.isConnected)target.innerHTML=notice('unavailable');}
}
function demoEarthCards(){
  return card('demoArchive','<div id="demoSmap">'+p('loading')+'</div><div class="tools"><a href="#map/moisture">'+text('smapMap')+' ↗</a><a href="/media/umm-al-quwain-smap.json">'+text('archiveFile')+' ↗</a><a href="https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap">'+text('sourceLabel')+' · NASA POWER ↗</a></div>')+
    card('ECOSTRESS',p('smapDemo')+p('heatDemo')+thermalLinks());
}
function sources(){
  if(isDemo())return heading('sources')+'<div class="split">'+demoEarthCards()+'</div><div class="section-stack">'+card('power',p('snapshotWeather')+'<a href="/showcase.html#earth-evidence">'+text('sourceSnapshot')+' ↗</a>')+'</div>';
  return heading('sources')+'<div class="split">'+card('granules',p('granuleInfo')+'<div id="catalogPanel">'+p('loading')+'</div>')+card('altSources','<div id="externalPanel">'+p('loading')+'</div>')+'</div><div class="split section-stack">'+card('SMAP','<div id="sourceSmap"></div>'+btn('load','data-earth="smap" data-target="sourceSmap"'))+card('power','<div id="sourcePower"></div>'+btn('load','data-earth="power" data-target="sourcePower"'))+'</div>';
}
async function loadCatalog(){
  const node=document.querySelector('#catalogPanel'), ref=document.querySelector('#externalPanel');
  try{
    dataset??=await api('/api/catalog');
    node.innerHTML='<div class="inline"><label>'+text('sourceLabel')+' <select id="catalogSelect">'+opts(Object.entries(dataset.catalog).map(([key,item])=>[key,item.title]),'ecostress')+'</select></label>'+btn('load','data-catalog')+'</div><div id="catalogResult"></div>';
    ref.innerHTML='<ul class="data-list">'+dataset.external.map(([name,url,region])=>'<li><a rel="noopener" target="_blank" href="'+esc(url)+'">'+esc(name)+' ↗</a><small>'+text(region==='us'?'regionUS':region==='na'?'regionNA':'refOnly')+'</small></li>').join('')+'</ul>';
  }catch{if(node)node.innerHTML=notice('unavailable');}
}
function settings(){return planInputs[field.id]??={priority:'water',budget:null,base:null,legume:null,mixed:null,...field.plan};}
function rotation(){
  const config=settings();
  return heading('rotation','planSub')+(isDemo()?notice('demoRotation'):'')+p('local','country-note muted')+(isDemo()?'':'<a class="text-action" href="#overview">'+text('planReference')+'</a>')+
  '<div class="panel control-panel"><label>'+text('budget')+'<input data-plan="budget" type="number" min="0" max="1000000" step="any" '+attr('value',config.budget)+'></label><label>'+text('priority')+'<select data-plan="priority">'+opts([['water','water'],['cover','cover'],['harvest','harvest']],config.priority)+'</select></label>'+(isDemo()?'<div class="tools">'+btn('tryTighter','data-demo-budget')+btn('resetBudget','data-demo-reset')+'</div>':'')+'</div><p id="planSummary" class="plan-summary" role="status"></p><div id="planCards" class="plan-grid">'+planMarkup()+'</div><div class="section-stack">'+card('intercrop',p('intercropBody')+'<div class="tools">'+(isDemo()?btn('useMine','data-field-new',true):btn('savePlans','data-save-plans',true))+'</div><p class="status" id="planStatus" role="status"></p>')+card('coverSteps','<ol>'+['sow','monitor','terminate'].map(key=>'<li>'+text(key)+'</li>').join('')+'</ol><a href="https://www.moccae.gov.ae/Content/Images/School/agriculture_calender_page_en.pdf" rel="noopener" target="_blank">'+text('calendarSource')+' ↗</a>')+'</div>';
}
const planKeys=['base','legume','mixed'];
function planMarkup(){
  const config=settings();
  const content={
    base:field.previous.filter(Boolean).length?'<div class="calendar">'+(isDemo()?['demoTomato','demoZucchini'].map(text):field.previous.filter(Boolean).map(esc)).map(c=>'<span>'+c+'</span>').join('')+'</div>':p('blankRotation'),
    legume:(field.country==='AE'?'<div class="calendar"><span>'+text('cowpea')+'</span><span>'+text('zucchini')+'</span></div>':'')+p('legumeWhy'),
    mixed:(field.country==='AE'?'<div class="calendar"><span>'+text('lettuce')+'</span><span>'+text('okra')+'</span></div>':'')+p('mixedWhy')
  };
  return planKeys.map(key=>'<section class="panel plan"><h2>'+text(key)+'</h2><div class="plan-details">'+content[key]+'</div><label>'+text('waterEntry')+'<input type="number" min="0" max="1000000" step="any" data-plan="'+key+'" '+attr('value',config[key])+'></label><div class="status" data-fit="'+key+'"></div>'+p('review')+'</section>').join('');
}
function updatePlan(){
  if(route()!=='rotation'||!field)return;
  const config=settings();
  const outcome=fieldEstimates.rotationFit(config,field.country==='AE');
  const rankLabel={water:'reasonWater',cover:'reasonCover',harvest:'reasonHarvest'};
  document.querySelectorAll('[data-fit]').forEach(node=>{
    const key=node.dataset.fit;
    const match=key===outcome.first;
    node.parentElement.classList.toggle('top-plan',match);
    node.textContent=t(config[key]===null?'needs':config.budget===null?'noBudget':match?'ranked':outcome.fit.includes(key)?'fits':'above');
    if(config[key]!==null&&config.budget!==null){
      const margin=config.budget-config[key];
      const number=Math.abs(margin).toLocaleString(lang,{maximumFractionDigits:2});
      node.append(' · '+t(margin<0?'budgetOver':'budgetMargin')+' '+number+' mm');
    }
  });
  const summary=document.getElementById('planSummary');
  const message=outcome.first?rankLabel[config.priority]:config.budget===null?'noBudget':outcome.fit.length?null:planKeys.some(key=>config[key]!==null)?'noPlanFits':'noPlanEstimates';
  summary.textContent=message?t(message):'';
}
const guides=[['guideStart','cover'],['guideTrial','trial'],['guideField','field-check']];
function learn(){
  const month=new Date().getMonth()+1;
  const timing=field.country==='AE'?(month>=9&&month<=11?'coverUae':'coverUaeWait'):'coverLocal';
  return heading('coverGuide','coverVideoNote')+card('coverTiming',p(timing)+'<div id="coverWeather"></div><a href="#heat">'+text('heatStress')+' ↗</a>')+'<div class="guide-grid section-stack">'+guides.map(([title,id])=>'<article class="panel guide"><video controls preload="none" playsinline aria-label="'+text(title)+'" poster="/videos/'+id+'.webp"><source src="/videos/'+id+'.mp4" type="video/mp4"><track kind="captions" src="/videos/'+id+'.en.vtt" srcLang="en" label="English"'+(lang==='en'?' default':'')+'><track kind="captions" src="/videos/'+id+'.ar.vtt" srcLang="ar" label="العربية"'+(lang==='ar'?' default':'')+'></video><h2>'+text(title)+'</h2></article>').join('')+'</div><div class="section-stack"><a href="#rotation">'+text('rotation')+' ↗</a></div>';
}
async function loadCoverContext(){
  const node=document.getElementById('coverWeather'), f=field;
  if(!node)return;
  let message='coverWeatherMissing';
  try{
    const server=await api(dataPath(f,'earth/forecast')).catch(()=>null);
    const response=!server||server.stale||server.unavailable?await forecastFromBrowser(f):server;
    if(response?.rows?.length){
      const hot=f.heat!=null&&response.rows.some(row=>Number.isFinite(row.values[0])&&row.values[0]>=f.heat);
      if(hot&&node.isConnected){node.innerHTML=fieldWarning('watch','coverWeather');return;}
      const demand=fieldEstimates.weatherReference(response.rows,null);
      if(demand&&node.isConnected){
        node.innerHTML=p('coverWeatherAvailable','status')+'<div class="measurement-value"><span>'+text('waterReference')+'</span><strong dir="ltr">'+demand.mm.toLocaleString(lang,{maximumSignificantDigits:3})+' mm</strong></div>';
        return;
      }
      message='coverWeatherAvailable';
    }
  }catch{}
  if(node.isConnected)node.innerHTML=p(message,'status');
}
const fieldCenters={AE:[25.54,55.59,10],KR:[36.5,127.8,7],AU:[-26,133,4],US:[39,-98,4],GB:[54,-2,5],IN:[22,79,5]};
let vertices=[],drawMode=false,sketch=null,pointMarker=null;
function input(key,value,type='text',extra=''){
  return '<label>'+text(key==='surfaceHeat'?'surfaceHeatLabel':key)+'<input name="'+key+'" type="'+type+'" '+attr('value',value)+' '+extra+'></label>';
}
function openField(edit,draft=null,openLimits=false){
  const f=edit?field:draft;
  const selected=f?.country??'AE';
  vertices=f?.polygon?.map(v=>[...v])??[];drawMode=false;sketch=null;pointMarker=null;
  dialog.className='dialog-wide';
  dialog.innerHTML='<div class="dialog-top"><h2 id="dialogTitle">'+text(edit?'edit':'add')+'</h2>'+btn('close','data-close')+'</div><form id="fieldForm" data-edit="'+(edit?'true':'false')+'">'+p('ownField')+'<div class="form-grid">'+input('name',f?.name,'text','maxlength="80"')+'<label>'+text('country')+'<select name="country">'+countries(selected)+'</select></label></div><div class="form-grid">'+input('lat',f?.lat,'number','required min="-85" max="85" step="any"')+input('lon',f?.lon,'number','required min="-180" max="180" step="any"')+'</div><div class="tools">'+btn('pin','data-pin aria-pressed="true"')+btn('draw','data-draw aria-pressed="false"')+btn('clear','data-clear')+'</div><p class="status">'+text('fieldSelection')+'</p><div id="fieldSetupMap" class="field-map" dir="ltr"></div><details><summary>'+text('optional')+'</summary><label>'+text('crop')+'<select name="crop">'+opts([['','unknownCrop'],['palm','palm'],['vegetables','vegetables'],['other','other']],f?.crop??'')+'</select></label><div class="form-grid">'+input('baseline1',f?.previous?.[0],'text','maxlength="50"')+input('baseline2',f?.previous?.[1],'text','maxlength="50"')+'</div><details><summary>'+text('thresholds')+'</summary><div class="form-grid">'+[['dry',100],['wet',100],['maxEc',100],['soilEcLimit',100],['labEcLimit',100],['surfaceHeat',95],['eventLimit',1e8],['depth',300],['ece',100],['heat',65]].map(([key,max])=>input(key,f?.[key],'number','min="0" max="'+max+'" step="any"')).join('')+'</div></details></details><div class="dialog-actions"><button class="primary" type="submit">'+text(account?'save':'continueSetup')+'</button><p class="status" role="status"></p></div></form>';
  if(openLimits)for(const details of dialog.querySelectorAll('details'))details.open=true;
  dialog.showModal();
  if(openLimits)dialog.querySelector('[name=dry]').focus();
  const [lat,lon,zoom]=f?[f.lat,f.lon,14]:(fieldCenters[selected]??[15,0,2]);
  fieldMap=baseMap('fieldSetupMap',[lat,lon],zoom);
  if(!fieldMap)return;
  const form=dialog.querySelector('form');
  if(f)pointMarker=L.circleMarker([lat,lon],{radius:8,color:'#fff',fillColor:'#315738',fillOpacity:1}).addTo(fieldMap);
  sketch=L.polygon(vertices,{color:'#ddeaab'}).addTo(fieldMap);
  if(vertices.length)fieldMap.fitBounds(sketch.getBounds(),{padding:[12,12],maxZoom:17});
  form.elements.country.addEventListener('change',()=>{
    const [a,b,z]=fieldCenters[form.elements.country.value]??[15,0,2];fieldMap.setView([a,b],z);
  });
  fieldMap.on('click',event=>{
    const coord=[event.latlng.lat,L.Util.wrapNum(event.latlng.lng,[-180,180])];
    if(drawMode&&vertices.length<100){vertices.push(coord);sketch.setLatLngs(vertices);}
    const point=drawMode?vertices[0]:coord;
    if(pointMarker)pointMarker.setLatLng(point);
    else pointMarker=L.circleMarker(point,{radius:8,color:'#fff',fillColor:'#315738',fillOpacity:1}).addTo(fieldMap);
    form.elements.lat.value=point[0].toFixed(6);form.elements.lon.value=point[1].toFixed(6);
  });
}
dialog.addEventListener('close',()=>{if(fieldMap){fieldMap.remove();fieldMap=null;}});
function enterField(saved){
  fields=[...fields.filter(item=>item.id!==saved.id),saved];
  if(route()!=='overview')location.hash='overview';
  setField(saved.id);
}
async function session(){
  let signedIn;
  try{signedIn=await api('/api/me');}
  catch(error){if(error.message==='signIn')return;throw error;}
  const ownedFields=await api('/api/fields');
  account=signedIn;fields=ownedFields;authOpen=false;
  if(pendingField){
    const draft=pendingField;
    pendingField=null;
    try{enterField(await api('/api/fields','POST',draft));}
    catch{
      setField(localStorage.getItem('pump-last-field-'+account.id));
      openField(false,draft);
      formStatus(document.getElementById('fieldForm'),'draftSaveFailed',true);
    }
  }else setField(localStorage.getItem('pump-last-field-'+account.id));
}
document.addEventListener('click',async event=>{
  if(event.target.closest('[data-skip]')){
    event.preventDefault();
    document.getElementById('main')?.focus();
    return;
  }
  const button=event.target.closest('button');
  if(!button)return;
  const a=button.dataset;
  if(isDemo()&&'demoBudget'in a){
    settings().budget=400;
    document.querySelector('[data-plan="budget"]').value=400;
    updatePlan();
  }
  if(isDemo()&&'demoReset'in a){
    delete planInputs[exampleField.id];
    render();
  }
  if('authToggle'in a){authMode=authMode==='login'?'register':'login';render();}
  if('signIn'in a){authMode='login';authOpen=true;render();}
  if('returnDemo'in a){authOpen=false;pendingField=null;setField('demo');}
  if('backField'in a){
    const draft=pendingField;
    authOpen=false;pendingField=null;render();openField(false,draft);
  }
  if('fieldNew'in a||'fieldEdit'in a)openField('fieldEdit'in a,null,'openLimits'in a);
  if('close'in a)dialog.close();
  if('pin'in a||'draw'in a){
    drawMode='draw'in a;dialog.querySelector('[data-pin]').setAttribute('aria-pressed',String(!drawMode));dialog.querySelector('[data-draw]').setAttribute('aria-pressed',String(drawMode));
  }
  if('clear'in a){vertices=[];sketch?.setLatLngs([]);}
  if('mapApply'in a)setOverlay();
  if('savePlans'in a){
    const f=field,node=document.getElementById('planStatus');button.disabled=true;
    try{
      const saved=await api(dataPath(f,'plan'),'PUT',settings());
      fields=fields.map(item=>item.id===saved.id?saved:item);
      if(field?.id===f.id){field=saved;node.textContent=t('saved');}
    }catch{node.textContent=t('serverError');}finally{button.disabled=false;}
  }
  if('signout'in a){
    try{await api('/api/logout','POST');account=null;fields=[];planInputs={};browserForecast=null;setField('demo');}catch{button.title=t('serverError');}
  }
  if(a.earth){delete currentSources[a.earth];loadEarth(a.earth,a.target);}
  if('catalog'in a){const kind=document.querySelector('#catalogSelect').value;delete currentSources[kind];loadEarth(kind,'catalogResult');}
  if(a.rotate){
    const f=field;button.disabled=true;
    try{const result=await api(dataPath(f,'devices/'+a.rotate+'/rotate'),'POST');if(field?.id===f.id)showToken(result.token);}
    catch{button.title=t('serverError');}finally{button.disabled=false;}
  }
});
document.addEventListener('input',event=>{
  const input=event.target;
  if(input.dataset.plan&&field){
    settings()[input.dataset.plan]=input.tagName==='SELECT'?input.value:input.value===''||!input.validity.valid?null:Number(input.value);updatePlan();
  }
});
document.addEventListener('change',event=>{
  const input=event.target;
  if(input.id==='fieldPicker')setField(input.value);
  if(input.id==='language'&&langs.includes(input.value)){lang=input.value;render();document.getElementById('language')?.focus();}
  if(input.id==='mapLayer'){
    const key=input.value;if(layers[key][2])document.querySelector('#mapDate').value=earlier(layers[key][2]);setOverlay();
  }
});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!['authForm','fieldForm','pairForm','csvForm'].includes(form.id))return;
  event.preventDefault();
  const button=form.querySelector('[type=submit]'), data=Object.fromEntries(new FormData(form)),f=field;
  button.disabled=true;formStatus(form,'loading');
  try{
    if(form.id==='authForm'){await api('/api/auth/'+authMode,'POST',data);await session();}
    if(form.id==='fieldForm'){
      const nullable=key=>data[key]===''?null:Number(data[key]);
      const body={...data,name:data.name.trim()||t('fieldDefault'),lat:Number(data.lat),lon:Number(data.lon),previous:[data.baseline1,data.baseline2],polygon:vertices,
        ...Object.fromEntries(['dry','wet','maxEc','soilEcLimit','labEcLimit','surfaceHeat','eventLimit','depth','ece','heat'].map(k=>[k,nullable(k)]))};
      const edit=form.dataset.edit==='true';
      if(body.polygon.length>0&&body.polygon.length<3)throw Error('invalidField');
      if(body.dry!=null&&body.wet!=null&&body.dry>=body.wet)throw Error('invalidField');
      if(!account){
        pendingField=body;
        dialog.close();
        authMode='register';authOpen=true;render();
        return;
      }
      const saved=await api(edit?'/api/fields/'+f.id:'/api/fields',edit?'PUT':'POST',body);
      dialog.close();
      if(edit){fields=fields.map(item=>item.id===saved.id?saved:item);setField(saved.id);}
      else enterField(saved);
    }
    if(form.id==='pairForm'){
      const device=await api(dataPath(f,'devices'),'POST',{label:data.label});
      if(field?.id===f.id){showToken(device.token);form.reset();formStatus(form,'saved');loadDevices();}
    }
    if(form.id==='csvForm'){
      if(data.file.size>100000)throw Error('reading');
      await api(dataPath(f,'import'),'POST',{rows:parseCsv(await data.file.text())});
      form.reset();formStatus(form,'saved');refreshReadings();
    }
  }catch(error){formStatus(form,labels[error.message]?error.message:'serverError',true);}
  finally{button.disabled=false;}
});
window.addEventListener('hashchange',()=>{render();updatePlan();scrollTo(0,0);});
render();session().catch(()=>{});
