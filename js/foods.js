/* ======================================================
   食材 / 成品菜数据库 foods.js
   —— 供「第三页 食物购物车甄选」使用
   字段：
     id       唯一标识
     name     名称
     kind     raw 食材 / dish 成品菜 / snack 零食 / drink 饮品
     nature   性味（寒/凉/平/温/热 + 甘/苦/辛/酸/咸）
     meridian 归经
     tz       适宜体质（数组）
     badTz    不宜体质（数组）
     badDis   不宜慢病（对应 rule.js DISEASE 的 key）
     season   适宜季节
     note     一句话说明
     alt      替代建议（不可取时可换什么）
   ====================================================== */

const FOODS = [
  /* ============ 一、主食 / 谷物 ============ */
  { id: "f001", name: "小米", kind: "raw", cat: "主食", nature: "凉·甘咸", meridian: "脾、胃、肾",
    tz: ["胃寒", "寒湿", "肾阴虚", "平和"], badTz: [], badDis: [], season: ["四季"],
    note: "养胃和中、安神。煮粥上层米油最养胃气。", alt: "" },
  { id: "f002", name: "山药", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、肺、肾",
    tz: ["胃寒", "寒湿", "肾阴虚", "肾阳虚", "结节体质", "平和"], badTz: [], badDis: [], season: ["秋", "冬", "四季"],
    note: "平补脾肺肾，三焦通吃。霜降后最当令。", alt: "" },
  { id: "f003", name: "糙米", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "湿热", "肝郁"], badTz: ["胃寒"], badDis: [], season: ["四季"],
    note: "膳食纤维高，控糖友好。胃寒者需煮软烂。", alt: "小米粥" },
  { id: "f004", name: "白粥", kind: "dish", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["胃寒", "寒湿", "平和"], badTz: [], badDis: ["diabetes"], season: ["四季"],
    note: "易消化但升糖快，糖尿病人不宜煮太烂、不宜单吃。", alt: "杂粮粥（加燕麦糙米）" },
  { id: "f005", name: "糯米", kind: "raw", cat: "主食", nature: "温·甘", meridian: "脾、胃、肺",
    tz: ["胃寒", "肾阳虚"], badTz: ["湿热", "肝郁"], badDis: ["diabetes", "gastritis"], season: ["冬"],
    note: "黏腻难消化，胃病、控糖者浅尝即止。", alt: "小米" },
  { id: "f006", name: "燕麦", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、肝",
    tz: ["湿热", "肝郁", "平和"], badTz: [], badDis: [], season: ["四季"],
    note: "降脂稳糖，早餐优选。选原味无糖款。", alt: "" },
  { id: "f007", name: "荞麦", kind: "raw", cat: "主食", nature: "凉·甘", meridian: "脾、胃、大肠",
    tz: ["湿热", "肝郁", "平和"], badTz: ["胃寒", "寒湿"], badDis: [], season: ["四季"],
    note: "清热降浊，但偏凉，胃寒者少食。", alt: "小米" },
  { id: "f008", name: "红薯", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、肾",
    tz: ["胃寒", "寒湿", "平和"], badTz: ["湿热"], badDis: ["diabetes"], season: ["秋", "冬"],
    note: "通便补中，但含糖高、易胀气，控糖者限量。", alt: "山药" },
  { id: "f009", name: "芋头", kind: "raw", cat: "主食", nature: "平·甘辛", meridian: "脾、胃",
    tz: ["胃寒", "结节体质", "平和"], badTz: ["湿热"], badDis: ["diabetes"], season: ["秋", "冬"],
    note: "健脾散结，漳州秋季当令。含淀粉高，主食要减量。", alt: "" },
  { id: "f010", name: "玉米", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、胃、大肠",
    tz: ["湿热", "平和", "肝郁"], badTz: [], badDis: [], season: ["夏", "秋"],
    note: "利湿通便，粗粮优选。", alt: "" },
  { id: "f011", name: "吐司", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["胃寒", "平和", "寒湿"], badTz: ["湿热"], badDis: ["diabetes"], season: ["四季"],
    note: "早餐常吃的主食。控糖者选全麦，少抹甜酱、果酱。", alt: "全麦吐司" },
  { id: "f012", name: "煎饼", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "寒湿", "胃寒"], badTz: ["湿热", "肾阴虚"], badDis: ["hyperlipid"], season: ["四季"],
    note: "面糊油煎，香脆但油量不小。控脂者少油煎，配豆浆更均衡。", alt: "全麦卷饼" },
  { id: "f013", name: "馒头", kind: "raw", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "寒湿"], badTz: [], badDis: ["diabetes"], season: ["四季"],
    note: "发酵面食好消化、不生湿，配蛋与蔬菜更稳血糖。控糖者选杂粮款、定量吃。", alt: "全麦馒头" },
  { id: "f014", name: "烧麦", kind: "dish", cat: "主食", nature: "温·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "寒湿"], badTz: ["湿热"], badDis: ["hyperlipid", "uric"], season: ["四季"],
    note: "糯米馅料扎实顶饱。选瘦肉香菇馅、避开重油款；趁热吃，别配浓汤，一次 3～4 个即可。", alt: "瘦肉馅烧麦" },
  { id: "f015", name: "水饺", kind: "dish", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "结节体质"], badTz: [], badDis: ["uric"], season: ["四季"],
    note: "皮薄馅足、水煮不油腻。选白菜/香菇瘦肉馅，痛风者少虾仁馅；吃饺子不喝汤。", alt: "蒸饺" },
  { id: "f016", name: "小笼包", kind: "dish", cat: "主食", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒"], badTz: ["湿热"], badDis: ["hyperlipid"], season: ["四季"],
    note: "汤汁鲜美但内馅偏肥、容易烫口。选瘦肉馅、一次 4～5 个，趁热慢吃；脾胃弱者不配浓汤。", alt: "瘦肉馅小笼包" },

  /* ============ 二、蔬菜 ============ */
  { id: "f101", name: "白萝卜", kind: "raw", cat: "蔬菜", nature: "凉·辛甘", meridian: "肺、胃",
    tz: ["湿热", "肝郁", "结节体质", "平和"], badTz: ["胃寒", "肾阳虚"], badDis: [], season: ["秋", "冬"],
    note: "下气消食化痰。生吃偏凉，胃寒者务必煮熟。", alt: "胡萝卜（煮熟）" },
  { id: "f102", name: "山药（菜用）", kind: "raw", cat: "蔬菜", nature: "平·甘", meridian: "脾、肺、肾",
    tz: ["胃寒", "寒湿", "肾阴虚", "结节体质", "平和"], badTz: [], badDis: [], season: ["秋", "冬"],
    note: "同主食栏山药，平补不燥。", alt: "" },
  { id: "f103", name: "冬瓜", kind: "raw", cat: "蔬菜", nature: "凉·甘淡", meridian: "肺、大肠、小肠",
    tz: ["湿热", "肝郁", "平和"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: [], season: ["夏", "秋"],
    note: "利水消肿，夏季消暑首选。脾胃虚寒者少吃。", alt: "丝瓜（偏平）" },
  { id: "f104", name: "丝瓜", kind: "raw", cat: "蔬菜", nature: "凉·甘", meridian: "肺、肝、胃",
    tz: ["湿热", "肝郁", "平和"], badTz: ["胃寒", "寒湿"], badDis: [], season: ["夏"],
    note: "清热通络，漳州夏季家常。", alt: "佛手瓜" },
  { id: "f105", name: "苦瓜", kind: "raw", cat: "蔬菜", nature: "寒·苦", meridian: "心、脾、胃",
    tz: ["湿热"], badTz: ["胃寒", "寒湿", "肾阳虚", "肾阴虚"], badDis: ["gastritis"], season: ["夏"],
    note: "清心火、降血糖，但性寒。胃寒者、孕妇慎食。", alt: "丝瓜" },
  { id: "f106", name: "芥蓝", kind: "raw", cat: "蔬菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "湿热", "肝郁", "结节体质"], badTz: [], badDis: [], season: ["秋", "冬", "春"],
    note: "漳州常青菜，富含维生素 C 与钙。", alt: "" },
  { id: "f107", name: "菠菜", kind: "raw", cat: "蔬菜", nature: "凉·甘", meridian: "肝、胃、大肠",
    tz: ["肝郁", "湿热", "肾阴虚", "平和"], badTz: ["胃寒"], badDis: [], season: ["春", "秋"],
    note: "养血润燥。含草酸，焯水后再炒；结石者适量。", alt: "芥蓝" },
  { id: "f108", name: "茼蒿", kind: "raw", cat: "蔬菜", nature: "平·辛甘", meridian: "脾、胃",
    tz: ["肝郁", "胃寒", "平和", "结节体质"], badTz: [], badDis: [], season: ["秋", "冬"],
    note: "理气宽中、安神。火锅与清炒皆宜。", alt: "" },
  { id: "f109", name: "莲藕", kind: "raw", cat: "蔬菜", nature: "凉·甘", meridian: "心、脾、胃",
    tz: ["肾阴虚", "湿热", "肝郁", "平和"], badTz: ["胃寒"], badDis: [], season: ["秋"],
    note: "生用清热、熟用健脾。胃寒者必须炖熟吃。", alt: "山药" },
  { id: "f110", name: "韭菜", kind: "raw", cat: "蔬菜", nature: "温·辛", meridian: "肝、胃、肾",
    tz: ["肾阳虚", "寒湿"], badTz: ["湿热", "肾阴虚", "结节体质", "胃寒"], badDis: ["gastritis"], season: ["春"],
    note: "温阳散寒，但辛温助火。湿热、阴虚、胃病者少吃。", alt: "茼蒿" },
  { id: "f111", name: "空心菜", kind: "raw", cat: "蔬菜", nature: "凉·甘", meridian: "胃、大肠",
    tz: ["湿热", "平和"], badTz: ["胃寒", "寒湿"], badDis: [], season: ["夏"],
    note: "清热通便。性凉，脾胃虚寒者少食。", alt: "芥蓝" },
  { id: "f112", name: "佛手瓜", kind: "raw", cat: "蔬菜", nature: "平·甘", meridian: "肝、胃",
    tz: ["肝郁", "结节体质", "湿热", "平和"], badTz: [], badDis: [], season: ["夏", "秋"],
    note: "疏肝理气、化痰。漳州夏季当家菜，肝郁与结节体质首选。", alt: "" },
  { id: "f113", name: "南瓜", kind: "raw", cat: "蔬菜", nature: "温·甘", meridian: "脾、胃",
    tz: ["胃寒", "寒湿", "平和"], badTz: ["湿热"], badDis: ["diabetes"], season: ["秋"],
    note: "温中补气，但含糖高。控糖者当主食算，别当菜。", alt: "山药" },
  { id: "f114", name: "番茄", kind: "raw", cat: "蔬菜", nature: "微寒·甘酸", meridian: "肝、脾、胃",
    tz: ["湿热", "肝郁", "平和"], badTz: ["胃寒"], badDis: ["gastritis"], season: ["夏", "秋"],
    note: "生津开胃。胃酸多、胃寒者少生吃，熟食为宜。", alt: "南瓜" },
  { id: "f115", name: "木耳（黑）", kind: "raw", cat: "菌菇干货", nature: "平·甘", meridian: "肺、胃、大肠",
    tz: ["结节体质", "湿热", "肾阴虚", "平和"], badTz: [], badDis: [], season: ["四季"],
    note: "润肺化痰、降血脂。泡发别超过 4 小时，防米酵菌酸。", alt: "" },
  { id: "f116", name: "香菇", kind: "raw", cat: "菌菇干货", nature: "平·甘", meridian: "脾、胃",
    tz: ["胃寒", "结节体质", "平和"], badTz: ["湿热"], badDis: [], season: ["四季"],
    note: "健脾益气、增强免疫。痛风急性期少喝菌汤（嘌呤溶于汤）。", alt: "" },
  { id: "f117", name: "白萝卜（生）", kind: "raw", cat: "蔬菜", nature: "凉·辛甘", meridian: "肺、胃",
    tz: ["湿热", "结节体质"], badTz: ["胃寒", "寒湿"], badDis: [], season: ["秋", "冬"],
    note: "凉拌生吃下气最强，但最伤胃阳。胃寒者禁止生吃。", alt: "萝卜炖汤" },

  /* ============ 三、肉禽蛋 ============ */
  { id: "f201", name: "鸡肉", kind: "raw", cat: "肉禽", nature: "温·甘", meridian: "脾、胃",
    tz: ["胃寒", "肾阳虚", "寒湿", "平和"], badTz: ["湿热", "肝郁"], badDis: ["uric"], season: ["四季"],
    note: "温中益气。去皮炖汤更清爽；痛风者少喝浓鸡汤。", alt: "瘦猪肉" },
  { id: "f202", name: "鸭肉", kind: "raw", cat: "肉禽", nature: "凉·甘咸", meridian: "肺、胃、肾",
    tz: ["肾阴虚", "湿热", "结节体质"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: [], season: ["秋", "夏"],
    note: "滋阴清热，「秋燥吃鸭」正合时令。脾胃虚寒者少吃。", alt: "鸡肉" },
  { id: "f203", name: "羊肉", kind: "raw", cat: "肉禽", nature: "热·甘", meridian: "脾、肾",
    tz: ["肾阳虚", "寒湿"], badTz: ["湿热", "肾阴虚", "结节体质", "肝郁"], badDis: ["uric", "hypertension"], season: ["冬"],
    note: "大热温补，冬令佳品。但湿热、阴虚、结节体质是发物，痛风忌。", alt: "鸡肉（去皮）" },
  { id: "f204", name: "牛肉", kind: "raw", cat: "肉禽", nature: "平·甘", meridian: "脾、胃",
    tz: ["胃寒", "寒湿", "平和"], badTz: ["湿热"], badDis: ["uric", "hyperlipid"], season: ["秋", "冬"],
    note: "补脾胃、强筋骨。选瘦肉、炖烂；痛风与高血脂者限量。", alt: "鸡肉" },
  { id: "f205", name: "瘦猪肉", kind: "raw", cat: "肉禽", nature: "平·甘咸", meridian: "脾、胃、肾",
    tz: ["平和", "肾阴虚", "胃寒"], badTz: ["湿热"], badDis: ["hyperlipid"], season: ["四季"],
    note: "滋阴润燥，最平和的肉。选里脊、少油烹调。", alt: "" },
  { id: "f206", name: "鸡蛋", kind: "raw", cat: "蛋", nature: "平·甘", meridian: "心、肺、脾",
    tz: ["平和", "胃寒", "肾阴虚", "结节体质"], badTz: ["湿热"], badDis: ["hyperlipid"], season: ["四季"],
    note: "滋阴养血，最优质的蛋白。血脂高者每日不超 1 个蛋黄。", alt: "蛋白" },
  { id: "f207", name: "猪肝", kind: "raw", cat: "肉禽", nature: "温·甘苦", meridian: "肝",
    tz: ["肝郁"], badTz: ["湿热", "结节体质"], badDis: ["hyperlipid", "uric"], season: ["四季"],
    note: "补肝养血、明目。但胆固醇与嘌呤都高，高血脂、痛风忌。", alt: "瘦肉" },

  /* ============ 四、水产 ============ */
  { id: "f301", name: "鲈鱼", kind: "raw", cat: "水产", nature: "平·甘", meridian: "肝、脾、肾",
    tz: ["胃寒", "肾阴虚", "结节体质", "平和"], badTz: [], badDis: [], season: ["春", "秋", "四季"],
    note: "补肝肾、益脾胃，最温和的鱼。清蒸最佳。", alt: "" },
  { id: "f302", name: "黄翅鱼", kind: "raw", cat: "水产", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "肾阴虚"], badTz: [], badDis: [], season: ["夏", "秋"],
    note: "漳州近海家常鱼，肉质细嫩易消化。", alt: "鲈鱼" },
  { id: "f303", name: "虾", kind: "raw", cat: "水产", nature: "温·甘", meridian: "肝、肾",
    tz: ["肾阳虚", "胃寒"], badTz: ["湿热", "结节体质"], badDis: ["uric"], season: ["夏", "秋"],
    note: "补肾壮阳。但嘌呤高、属发物，痛风与结节体质慎食。", alt: "鲈鱼" },
  { id: "f304", name: "螃蟹", kind: "raw", cat: "水产", nature: "寒·咸", meridian: "肝、胃",
    tz: ["湿热"], badTz: ["胃寒", "寒湿", "肾阳虚", "肾阴虚"], badDis: ["gastritis", "uric"], season: ["秋"],
    note: "清热散血，但大寒。胃寒、痛风、孕妇忌；必须彻底煮熟。", alt: "鲈鱼" },
  { id: "f305", name: "海蛎（生蚝）", kind: "raw", cat: "水产", nature: "微寒·甘咸", meridian: "肝、肾",
    tz: ["肾阴虚", "肝郁"], badTz: ["胃寒", "寒湿", "湿热"], badDis: ["uric"], season: ["冬", "春"],
    note: "滋阴养血、补锌。漳州特产，但嘌呤极高，痛风忌；务必熟食。", alt: "鲈鱼" },
  { id: "f306", name: "海带", kind: "raw", cat: "水产", nature: "寒·咸", meridian: "肝、胃、肾",
    tz: ["湿热", "结节体质"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: ["thyroidNodule"], season: ["四季"],
    note: "软坚散结、利水。甲状腺结节不必刻意忌，但别大量煲浓汤；甲亢者忌。", alt: "木耳" },
  { id: "f307", name: "紫菜", kind: "raw", cat: "水产", nature: "寒·甘咸", meridian: "肺、脾、膀胱",
    tz: ["湿热", "结节体质"], badTz: ["胃寒", "寒湿"], badDis: ["thyroidNodule"], season: ["四季"],
    note: "化痰软坚。碘含量高，甲亢忌；甲状腺结节适量即可。", alt: "木耳" },

  /* ============ 五、豆制品 ============ */
  { id: "f401", name: "豆腐", kind: "raw", cat: "豆制品", nature: "凉·甘", meridian: "脾、胃、大肠",
    tz: ["湿热", "肾阴虚", "结节体质", "平和"], badTz: ["胃寒", "寒湿"], badDis: ["uric"], season: ["四季"],
    note: "清热润燥、优质植物蛋白。但嘌呤中等，痛风急性期限量；胃寒者吃热的。", alt: "鸡蛋" },
  { id: "f402", name: "豆浆", kind: "drink", cat: "豆制品", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "肾阴虚", "湿热"], badTz: [], badDis: ["uric"], season: ["四季"],
    note: "滋阴润燥。必须煮沸彻底；痛风者适量。", alt: "米浆" },

  /* ============ 六、水果 ============ */
  { id: "f501", name: "梨", kind: "raw", cat: "水果", nature: "凉·甘", meridian: "肺、胃",
    tz: ["肾阴虚", "湿热", "结节体质"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: [], season: ["秋"],
    note: "润肺止咳，秋燥首选。但性凉，胃寒者炖熟吃（冰糖炖梨）。", alt: "蒸梨" },
  { id: "f502", name: "柚子", kind: "raw", cat: "水果", nature: "寒·甘酸", meridian: "肺、脾",
    tz: ["湿热", "肝郁"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: [], season: ["秋", "冬"],
    note: "理气化痰、消食。漳州平和琯溪蜜柚当令。性寒，胃寒者少食；服降压药者注意西柚相互作用。", alt: "苹果" },
  { id: "f503", name: "番石榴", kind: "raw", cat: "水果", nature: "平·甘涩", meridian: "脾、胃",
    tz: ["湿热", "平和"], badTz: [], badDis: [], season: ["秋", "冬"],
    note: "收敛止泻、维 C 高。漳州特产。便秘者少食。", alt: "" },
  { id: "f504", name: "苹果", kind: "raw", cat: "水果", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "肾阴虚", "肝郁"], badTz: [], badDis: [], season: ["四季"],
    note: "健脾生津，最平和的水果，全家都能吃。", alt: "" },
  { id: "f505", name: "荔枝", kind: "raw", cat: "水果", nature: "温·甘酸", meridian: "脾、肝",
    tz: ["肾阳虚", "寒湿"], badTz: ["湿热", "肾阴虚", "肝郁", "结节体质"], badDis: ["diabetes"], season: ["夏"],
    note: "温补气血，但极容易上火。湿热、阴虚者忌；空腹大量吃易低血糖。", alt: "苹果" },
  { id: "f506", name: "西瓜", kind: "raw", cat: "水果", nature: "寒·甘", meridian: "心、胃、膀胱",
    tz: ["湿热"], badTz: ["胃寒", "寒湿", "肾阳虚", "肾阴虚"], badDis: ["diabetes"], season: ["夏"],
    note: "清热解暑，但大寒。胃寒、控糖者忌；别吃冰镇西瓜。", alt: "苹果" },

  /* ============ 七、药食同源 / 调味 ============ */
  { id: "f601", name: "生姜", kind: "raw", cat: "药食同源", nature: "温·辛", meridian: "肺、脾、胃",
    tz: ["胃寒", "寒湿", "肾阳虚"], badTz: ["湿热", "肾阴虚"], badDis: ["gastritis"], season: ["四季"],
    note: "温中散寒、止呕。早晨吃最好，晚上少吃（「晚吃姜赛砒霜」指量大时）。", alt: "" },
  { id: "f602", name: "红枣", kind: "raw", cat: "药食同源", nature: "温·甘", meridian: "脾、胃",
    tz: ["胃寒", "寒湿", "肾阳虚", "平和"], badTz: ["湿热", "结节体质"], badDis: ["diabetes"], season: ["四季"],
    note: "补中益气、养血。但含糖高，控糖者限量；湿热者易生湿。", alt: "桂圆（更少量）" },
  { id: "f603", name: "枸杞", kind: "raw", cat: "药食同源", nature: "平·甘", meridian: "肝、肾",
    tz: ["肾阴虚", "肝郁", "肾阳虚"], badTz: ["湿热"], badDis: [], season: ["四季"],
    note: "滋补肝肾、明目。每日 10–15 粒即可，感冒发热时停。", alt: "" },
  { id: "f604", name: "陈皮", kind: "raw", cat: "药食同源", nature: "温·辛苦", meridian: "脾、肺",
    tz: ["寒湿", "肝郁", "结节体质", "胃寒"], badTz: ["肾阴虚"], badDis: [], season: ["四季"],
    note: "理气健脾、燥湿化痰。越陈越好，三年以上为佳。", alt: "" },
  { id: "f605", name: "薏米", kind: "raw", cat: "药食同源", nature: "凉·甘淡", meridian: "脾、胃、肺",
    tz: ["湿热", "结节体质"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: [], season: ["夏", "秋"],
    note: "利水渗湿、健脾。性凉，孕妇忌；寒湿者需炒过再用。", alt: "炒薏米" },
  { id: "f606", name: "玫瑰花", kind: "raw", cat: "药食同源", nature: "温·甘微苦", meridian: "肝、脾",
    tz: ["肝郁", "结节体质"], badTz: ["湿热"], badDis: [], season: ["四季"],
    note: "疏肝解郁、活血。经期量多者暂停。", alt: "" },

  /* ============ 八、成品菜 / 家常菜 ============ */
  { id: "d001", name: "清蒸鲈鱼", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "肝、脾、肾",
    tz: ["胃寒", "肾阴虚", "结节体质", "平和"], badTz: [], badDis: [], season: ["四季"],
    note: "最温和的家常鱼菜，全家适用。蒸 8 分钟即可，别过火。", alt: "" },
  { id: "d002", name: "白切鸡", kind: "dish", cat: "成品菜", nature: "温·甘", meridian: "脾、胃",
    tz: ["胃寒", "寒湿", "平和"], badTz: ["湿热"], badDis: ["uric"], season: ["四季"],
    note: "原味少油，蘸料别放太多沙茶。痛风者少吃、别喝汤。", alt: "清蒸鱼" },
  { id: "d003", name: "沙茶面", kind: "dish", cat: "成品菜", nature: "温·辛", meridian: "脾、胃",
    tz: ["寒湿", "胃寒"], badTz: ["湿热", "肾阴虚", "结节体质"], badDis: ["hypertension", "hyperlipid", "gastritis"], season: ["四季"],
    note: "漳州名小吃，但沙茶酱高盐高油、辛辣。高血压、高血脂、胃病者不宜常吃。", alt: "清汤面" },
  { id: "d004", name: "卤面", kind: "dish", cat: "成品菜", nature: "温·甘", meridian: "脾、胃",
    tz: ["胃寒", "平和"], badTz: ["湿热", "肾阴虚"], badDis: ["hypertension", "hyperlipid", "diabetes"], season: ["四季"],
    note: "漳州喜宴必备，勾芡重油、含糖。三高人群浅尝。", alt: "清汤面" },
  { id: "d005", name: "四果汤", kind: "dish", cat: "成品菜", nature: "寒·甘", meridian: "心、胃",
    tz: ["湿热"], badTz: ["胃寒", "寒湿", "肾阳虚"], badDis: ["diabetes"], season: ["夏"],
    note: "漳州消暑甜品，冰镇加糖。胃寒者、控糖者不宜。", alt: "常温银耳羹（无糖）" },
  { id: "d006", name: "手抓面", kind: "dish", cat: "成品菜", nature: "温·甘", meridian: "脾、胃",
    tz: ["平和", "寒湿"], badTz: ["湿热"], badDis: ["hypertension", "hyperlipid"], season: ["四季"],
    note: "漳州传统，多配卤味与甜酱，盐油偏高。", alt: "清汤面" },
  { id: "d007", name: "锅边糊", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["胃寒", "平和", "寒湿"], badTz: [], badDis: [], season: ["四季"],
    note: "米浆现煮，温热易消化，早餐友好。少放味精。", alt: "" },
  { id: "d008", name: "炒米粉", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒"], badTz: ["湿热"], badDis: ["hyperlipid"], season: ["四季"],
    note: "家常主食，注意控油；配蔬菜与蛋白更均衡。", alt: "" },
  { id: "d009", name: "海蛎煎", kind: "dish", cat: "成品菜", nature: "微寒·甘", meridian: "肝、肾",
    tz: ["肾阴虚"], badTz: ["胃寒", "寒湿", "湿热"], badDis: ["uric", "hyperlipid"], season: ["冬", "春"],
    note: "漳州招牌，但海蛎嘌呤高 + 地瓜粉油煎。痛风、高血脂、胃寒者不宜。", alt: "清蒸鱼" },
  { id: "d010", name: "白灼虾", kind: "dish", cat: "成品菜", nature: "温·甘", meridian: "肝、肾",
    tz: ["肾阳虚", "胃寒"], badTz: ["湿热", "结节体质"], badDis: ["uric"], season: ["夏", "秋"],
    note: "做法清淡，但虾属发物。痛风急性期、结节体质慎食。", alt: "白灼菜心" },
  { id: "d011", name: "排骨汤", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、肾",
    tz: ["平和", "肾阴虚", "胃寒"], badTz: ["湿热"], badDis: ["uric", "hyperlipid"], season: ["秋", "冬"],
    note: "滋补但嘌呤与脂肪都溶在汤里。痛风、高血脂者喝汤要撇油、少量。", alt: "蔬菜汤" },
  { id: "d012", name: "番茄炒蛋", kind: "dish", cat: "成品菜", nature: "微温·甘酸", meridian: "脾、胃、肝",
    tz: ["平和", "胃寒", "肝郁", "肾阴虚"], badTz: ["湿热"], badDis: ["gastritis"], season: ["四季"],
    note: "家常百搭，营养均衡。胃酸多者少放番茄。", alt: "" },
  { id: "d013", name: "清炒时蔬", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "湿热", "肝郁", "胃寒", "结节体质"], badTz: [], badDis: [], season: ["四季"],
    note: "最安全的选择。选当季菜、少油快炒。", alt: "" },
  { id: "d014", name: "山药排骨汤", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、肺、肾",
    tz: ["胃寒", "寒湿", "肾阴虚", "肾阳虚", "平和"], badTz: ["湿热"], badDis: ["uric"], season: ["秋", "冬"],
    note: "平补脾肺肾，全家适用。痛风者撇油少喝汤。", alt: "山药炖鸡（去皮）" },
  { id: "d015", name: "姜母鸭", kind: "dish", cat: "成品菜", nature: "温·辛甘", meridian: "脾、胃、肾",
    tz: ["肾阳虚", "寒湿", "胃寒"], badTz: ["湿热", "肾阴虚", "结节体质"], badDis: ["uric", "hypertension"], season: ["秋", "冬"],
    note: "闽南冬令进补名菜，温补力强。但湿热、阴虚、痛风者不宜。", alt: "山药炖鸡" },
  { id: "d016", name: "寿司", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "肾阴虚", "胃寒"], badTz: ["寒湿", "结节体质"], badDis: ["diabetes"], season: ["四季"],
    note: "米饭 + 鱼生/蛋卷。生冷部分胃寒者少食，饭量注意控糖；选熟料款更稳妥。", alt: "寿司（熟食款）" },

  /* ---- v5 补充：家常成品菜谱（常见做法款） ---- */
  { id: "d017", name: "番茄炒蛋", kind: "dish", cat: "成品菜", nature: "微温·甘酸", meridian: "脾、胃、肝",
    tz: ["平和", "胃寒", "湿热", "肝郁"], badTz: [], badDis: ["gastritis"], season: ["四季"],
    note: "国民家常菜。番茄红素经油炒吸收更好；胃酸多者少放番茄。", alt: "" },
  { id: "d018", name: "青椒牛肉丝", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "肾阳虚"], badTz: ["湿热"], badDis: ["uric", "hyperlipid"], season: ["四季"],
    note: "牛肉逆纹切上浆才嫩。高血脂、痛风者限量（每周不超 2 次）。", alt: "青椒炒鸡丝" },
  { id: "d019", name: "水煮牛肉", kind: "dish", cat: "成品菜", nature: "温·辛甘", meridian: "脾、胃",
    tz: ["胃寒", "寒湿"], badTz: ["湿热", "肾阴虚"], badDis: ["uric", "hypertension", "gastritis"], season: ["秋", "冬"],
    note: "红油重盐，家庭版可减辣减油。高血压、痛风、胃病者不宜常吃。", alt: "清汤牛肉" },
  { id: "d020", name: "萝卜炖牛腩", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃、肺",
    tz: ["平和", "胃寒"], badTz: ["湿热"], badDis: ["uric", "hyperlipid"], season: ["秋", "冬"],
    note: "牛腩炖 90 分钟以.上软烂，白萝卜下气消食。痛风者吃肉不喝汤。", alt: "萝卜炖排骨" },
  { id: "d021", name: "鸡蛋灌饼", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒"], badTz: ["湿热"], badDis: ["hyperlipid", "diabetes"], season: ["四季"],
    note: "面+蛋+油煎。家庭版少油无酱比路边摊好很多，控脂控糖者少吃。", alt: "葱花鸡蛋软饼" },
  { id: "d022", name: "蛋煎馒头片", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒"], badTz: [], badDis: ["diabetes"], season: ["四季"],
    note: "隔夜馒头翻身吃法，裹蛋液煎。注意精制主食的量，别再配粥。", alt: "全麦馒头" },
  { id: "d023", name: "紫菜馄饨", kind: "dish", cat: "成品菜", nature: "平·甘咸", meridian: "脾、胃",
    tz: ["平和", "胃寒"], badTz: ["湿热"], badDis: ["uric"], season: ["四季"],
    note: "皮薄瘦肉馅的汤面食。痛风者少放虾皮、不喝浓汤底。", alt: "清汤水饺" },
  { id: "d024", name: "韭菜盒子", kind: "dish", cat: "成品菜", nature: "温·辛甘", meridian: "肝、胃、肾",
    tz: ["胃寒", "寒湿"], badTz: ["湿热", "肾阴虚", "结节体质", "胃寒"], badDis: ["gastritis"], season: ["春"],
    note: "春韭最香。但韭菜粗纤维 + 辛温，胃病与湿热者不碰。", alt: "葱花鸡蛋软饼" },

  /* ---- v23 补充：闽南漳州家常成品菜 ---- */
  { id: "d025", name: "酱油水巴浪鱼", kind: "dish", cat: "成品菜", nature: "平·甘咸", meridian: "脾、胃",
    tz: ["平和", "湿热", "痰湿"], badTz: ["胃寒"], badDis: ["uric"], season: ["四季"],
    note: "闽南家常酱油水做法，清淡高蛋白。痛风者慎食。", alt: "清蒸鲈鱼" },
  { id: "d026", name: "姜葱炒花蛤", kind: "dish", cat: "成品菜", nature: "凉·甘咸", meridian: "脾、胃",
    tz: ["平和", "湿热", "肝郁"], badTz: ["胃寒"], badDis: ["uric"], season: ["四季"],
    note: "贝类高蛋白低脂，闽南四季常见。嘌呤高，痛风者不吃。", alt: "丝瓜炒虾仁" },
  { id: "d027", name: "四神汤", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、肾、心",
    tz: ["痰湿", "湿热", "平和", "胃寒"], badTz: ["肾阴虚"], badDis: [], season: ["四季"],
    note: "茯苓莲子山药芡实，闽南国民祛湿汤。脾虚湿重者四季可喝。", alt: "" },
  { id: "d028", name: "漳州炒米粉", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "湿热"], badTz: [], badDis: [], season: ["四季"],
    note: "家庭少油版：瘦肉多菜。米粉易吸味，注意控盐。", alt: "咸稀饭" },
  { id: "d029", name: "咸稀饭", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "痰湿"], badTz: [], badDis: [], season: ["四季"],
    note: "漳州咸糜，一锅饭菜汤俱全，好消化。肠胃弱时首选。", alt: "" },
  { id: "d030", name: "锅边糊", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "痰湿", "胃寒"], badTz: ["湿热"], badDis: [], season: ["四季"],
    note: "米浆烫熟刮入汤，脆边软芯。配虾皮含嘌呤，痛风者改素汤底。", alt: "咸稀饭" },
  { id: "d031", name: "芥菜饭", kind: "dish", cat: "成品菜", nature: "平·辛甘", meridian: "肺、脾",
    tz: ["平和", "痰湿", "胃寒"], badTz: [], badDis: [], season: ["冬", "春"],
    note: "正月芥菜饭，菜饭合一。含钙高纤维足，冬春正季。", alt: "番薯饭" },
  { id: "d032", name: "芋头蒸排骨", kind: "dish", cat: "成品菜", nature: "平·甘", meridian: "脾、胃",
    tz: ["平和", "胃寒", "肾阳虚"], badTz: ["湿热"], badDis: ["uric"], season: ["秋", "冬"],
    note: "漳浦芋头粉糯吸肉汁。蒸制无油烟；痛风者吃芋头少吃排骨汤底。", alt: "芋头饭" },
  { id: "d033", name: "菜脯冬瓜鸭汤", kind: "dish", cat: "成品菜", nature: "凉·甘咸", meridian: "脾、胃、肺",
    tz: ["湿热", "平和", "肾阴虚"], badTz: ["胃寒"], badDis: ["hypertension"], season: ["夏"],
    note: "水鸭冬瓜清热利水。菜脯含盐，高血压者减半。", alt: "冬瓜排骨汤" },


  /* ============ 九、零食 / 饮品 ============ */
  { id: "s001", name: "碳酸饮料", kind: "drink", cat: "饮品", nature: "凉·甘", meridian: "脾、胃",
    tz: [], badTz: ["胃寒", "寒湿", "肾阳虚", "湿热", "结节体质"], badDis: ["diabetes", "fatty", "hypertension"], season: ["四季"],
    note: "高糖 + 磷酸 + 冰镇，伤脾胃、升血糖、影响钙吸收。建议直接戒。", alt: "淡茶 / 温水" },
  { id: "s002", name: "奶茶", kind: "drink", cat: "饮品", nature: "凉·甘", meridian: "脾、胃",
    tz: [], badTz: ["湿热", "寒湿", "胃寒", "结节体质"], badDis: ["diabetes", "fatty", "hyperlipid"], season: ["四季"],
    note: "高糖高脂 + 反式脂肪，一杯顶一餐热量。建议每周不超 1 杯、选无糖。", alt: "无糖豆浆" },
  { id: "s003", name: "啤酒", kind: "drink", cat: "饮品", nature: "凉·甘苦", meridian: "脾、胃、肝",
    tz: [], badTz: ["湿热", "寒湿", "胃寒", "结节体质"], badDis: ["uric", "fatty", "hypertension", "hyperlipid"], season: ["四季"],
    note: "「液体面包」+ 高嘌呤，痛风头号诱因。三高、脂肪肝、结节体质都建议戒。", alt: "无醇饮品" },
  { id: "s004", name: "油炸食品", kind: "snack", cat: "零食", nature: "温·甘", meridian: "脾、胃",
    tz: [], badTz: ["湿热", "肾阴虚", "结节体质"], badDis: ["hyperlipid", "fatty", "gastritis", "hypertension"], season: ["四季"],
    note: "高温油炸产生丙烯酰胺与反式脂肪。结节体质、三高、胃病都不宜。", alt: "蒸/烤（少油）" },
  { id: "s005", name: "烧烤", kind: "snack", cat: "零食", nature: "温·辛", meridian: "脾、胃",
    tz: [], badTz: ["湿热", "肾阴虚", "结节体质", "肝郁"], badDis: ["gastritis", "hypertension", "hyperlipid"], season: ["四季"],
    note: "明火烤制产生苯并芘等致癌物，且高盐辛辣。结节体质尤其要少。", alt: "清蒸 / 炖煮" },
  { id: "s006", name: "腌制品（菜脯/咸鱼）", kind: "snack", cat: "零食", nature: "温·咸", meridian: "脾、胃",
    tz: [], badTz: ["肾阴虚", "湿热"], badDis: ["hypertension", "gastritis"], season: ["四季"],
    note: "高盐 + 亚硝酸盐。高血压每日盐要 <5g，这类基本超一餐配额。", alt: "新鲜蔬菜" },
  { id: "s007", name: "坚果（原味）", kind: "snack", cat: "零食", nature: "平·甘", meridian: "脾、肾、肺",
    tz: ["平和", "肾阴虚", "肾阳虚", "寒湿"], badTz: ["湿热"], badDis: ["hyperlipid"], season: ["四季"],
    note: "补脑润肠、优质脂肪。每日一小把（约 25g），选原味不加盐不油炸。", alt: "" },
  { id: "s008", name: "黑巧克力（70%+）", kind: "snack", cat: "零食", nature: "温·苦甘", meridian: "心、脾",
    tz: ["肝郁", "平和"], badTz: ["湿热", "胃寒"], badDis: ["diabetes", "gastritis"], season: ["四季"],
    note: "少量可舒缓情绪。但含糖含脂，控糖、胃食管反流者不宜。", alt: "原味坚果" },
];

/* ---------- 自定义菜（含成品菜谱）合并进食物库 ----------
   localStorage 里手动添加的菜（storage.js addCustomDish）也会出现在
   「食物库」列表中，显示「自定」徽标、可加购物车、可参与甄选分析 */
function customFoodEntries() {
  try {
    if (typeof loadCustomDishes === "function") {
      return loadCustomDishes().map(function (d) {
        return {
          id: d.id, name: d.name, kind: "dish", cat: "成品菜",
          nature: d.natureTxt || "自定", meridian: "自定",
          tz: d.tz || [], badTz: d.badTz || [], badDis: [],
          season: d.season || ["四季"],
          note: d.note || ((d.steps && d.steps.length) ? "自定义菜谱：" + d.steps[0] : "自定义菜品"),
          alt: "", custom: true,
        };
      });
    }
  } catch (e) {}
  return [];
}

function allFoods() {
  return FOODS.concat(customFoodEntries());
}

/* 按分类分组（供勾选界面用）*/
function foodsByCat() {
  const map = {};
  allFoods().forEach(function (f) {
    if (!map[f.cat]) map[f.cat] = [];
    map[f.cat].push(f);
  });
  return map;
}

/* 分析某食物对当前家庭是否可取
   返回 { level: "good"|"ok"|"caution"|"bad", score, reasons[] } */
function analyzeFood(food, members) {
  const tizhiAll = window.ENGINE.mergeTizhi(members);
  const diseases = window.ENGINE.mergeDisease(members);
  const reasons = [];
  let score = 0;
  let hardBlock = false;
  let softWarn = 0;

  // 慢病硬否决
  (food.badDis || []).forEach(function (d) {
    if (diseases.indexOf(d) >= 0) {
      const label = window.RULE.DISEASE[d] ? window.RULE.DISEASE[d].label : d;
      reasons.push("家里有【" + label + "】，不宜");
      hardBlock = true;
    }
  });

  // 体质适宜加分
  (food.tz || []).forEach(function (t) {
    if (tizhiAll.indexOf(t) >= 0) {
      score += 10;
      reasons.push("适合【" + t + "】");
    }
  });

  // 体质不宜
  (food.badTz || []).forEach(function (t) {
    if (tizhiAll.indexOf(t) >= 0) {
      score -= 25;
      softWarn++;
      reasons.push("【" + t + "】不宜多吃");
    }
  });

  let level;
  if (hardBlock) level = "bad";
  else if (softWarn >= 2) level = "bad";
  else if (softWarn === 1) level = "caution";
  else if (score > 0) level = "good";
  else level = "ok";

  return { level: level, score: score, reasons: reasons, alt: food.alt || "" };
}

window.FOODS_DB = {
  FOODS: FOODS,
  allFoods: allFoods,
  customFoodEntries: customFoodEntries,
  foodsByCat: foodsByCat,
  analyzeFood: analyzeFood,
};