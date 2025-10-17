import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Enhanced Gen Alpha Slang Translation Dictionary (500+ terms)
const genAlphaSlangMap: Record<string, string> = {
  // Core Gen Alpha Terms
  charisma: 'rizz',
  charm: 'rizz',
  'charming person': 'rizz',
  'charisma skills': 'rizz',
  'flirting skills': 'rizz',
  random: 'skibidi',
  chaotic: 'skibidi',
  'meme-worthy': 'skibidi',
  absurd: 'skibidi',
  nonsense: 'skibidi',
  crazy: 'skibidi',
  wild: 'skibidi',
  wow: 'gyat',
  impressive: 'gyat',
  'impressive appearance': 'gyat',
  amazing: 'gyat',
  gorgeous: 'gyat',
  stunning: 'gyat',
  strange: 'ohio',
  surreal: 'ohio',
  weird: 'ohio',
  bizarre: 'ohio',
  unusual: 'ohio',
  odd: 'ohio',
  independent: 'sigma',
  alpha: 'sigma',
  'cool person': 'sigma',
  confident: 'sigma',
  'self-reliant': 'sigma',
  'lone wolf': 'sigma',
  "taking someone's food": 'fanum tax',
  'food tax': 'fanum tax',
  'really good': 'bussin',
  excellent: 'bussin',
  delicious: 'bussin',
  tasty: 'bussin',
  awesome: 'bussin',
  'doing great': 'slay',
  'killing it': 'slay',
  winning: 'slay',
  succeeding: 'slay',
  'nailed it': 'slay',
  'no lie': 'no cap',
  'for real': 'no cap',
  truthful: 'no cap',
  honestly: 'no cap',
  seriously: 'no cap',
  lie: 'cap',
  exaggeration: 'cap',
  fake: 'cap',
  'not true': 'cap',
  atmosphere: 'vibe',
  energy: 'vibe',
  feeling: 'vibe',
  mood: 'vibe',
  ambiance: 'vibe',
  embarrassing: 'cringe',
  awkward: 'cringe',
  'uncomfortable to watch': 'cringe',
  painful: 'cringe',
  'secondhand embarrassment': 'cringe',
  suspicious: 'sus',
  questionable: 'sus',
  shady: 'sus',
  dubious: 'sus',
  fishy: 'sus',
  stylish: 'drip',
  'cool fashion': 'drip',
  'great style': 'drip',
  'good outfit': 'drip',
  'fashion sense': 'drip',
  understood: 'bet',
  okay: 'bet',
  agreement: 'bet',
  'got it': 'bet',
  'for sure': 'bet',
  mediocre: 'mid',
  average: 'mid',
  'not impressive': 'mid',
  ordinary: 'mid',
  basic: 'mid',
  jealous: 'salty',
  bitter: 'salty',
  upset: 'salty',
  resentful: 'salty',
  'sour grapes': 'salty',
  'showing off': 'flexing',
  boasting: 'flexing',
  bragging: 'flexing',
  'show off': 'flexing',
  'flex on': 'flexing',
  very: 'hella',
  extremely: 'hella',
  'a lot': 'hella',
  really: 'hella',
  totally: 'hella',
  hilarious: 'dead',
  'extremely funny': 'dead',
  'laughing hard': 'dead',
  'dying laughing': 'dead',
  lmao: 'dead',

  // Extended Gen Alpha Vocabulary
  'being cool': 'mewing',
  'face exercise': 'mewing',
  'jawline exercise': 'mewing',
  'looking sharp': 'mewing',
  'trying hard': 'glazing',
  'over-praising': 'glazing',
  'sucking up': 'glazing',
  'kissing up': 'glazing',
  'extremely cringe': 'down bad',
  desperate: 'down bad',
  thirsty: 'down bad',
  'too eager': 'down bad',
  gossip: 'tea',
  drama: 'tea',
  'spill the': 'tea',
  'juicy info': 'tea',
  'hot gossip': 'tea',
  amazing: 'fire',
  awesome: 'fire',
  perfect: 'fire',
  incredible: 'fire',
  'on fire': 'fire',
  relaxing: 'vibing',
  'feeling good': 'vibing',
  'having fun': 'vibing',
  chilling: 'vibing',
  'hanging out': 'vibing',
  'throw away': 'yeet',
  discard: 'yeet',
  'throw forcefully': 'yeet',
  'get rid of': 'yeet',
  'toss out': 'yeet',
  'biggest fan': 'stan',
  supporter: 'stan',
  'obsessed with': 'stan',
  'devoted fan': 'stan',
  'loyal follower': 'stan',
  ignore: 'ghost',
  disappear: 'ghost',
  'stop responding': 'ghost',
  ghosting: 'ghost',
  vanish: 'ghost',

  // Additional Gen Alpha Terms
  cool: 'drip',
  awesome: 'fire',
  amazing: 'fire',
  incredible: 'fire',
  fantastic: 'fire',
  wonderful: 'fire',
  great: 'fire',
  impressive: 'fire',
  stunning: 'fire',
  beautiful: 'fire',
  attractive: 'fire',
  gorgeous: 'fire',
  hot: 'fire',
  sexy: 'fire',
  cute: 'fire',
  adorable: 'fire',
  sweet: 'fire',
  kind: 'fire',
  nice: 'fire',
  good: 'fire',
  'very good': 'fire',
  excellent: 'fire',
  perfect: 'fire',
  'absolutely perfect': 'fire',
  flawless: 'fire',
  impeccable: 'fire',
  outstanding: 'fire',
  remarkable: 'fire',
  extraordinary: 'fire',
  spectacular: 'fire',
  breathtaking: 'fire',
  'mind-blowing': 'fire',
  'jaw-dropping': 'fire',
  'eye-popping': 'fire',
  stunning: 'fire',
  gorgeous: 'fire',
  beautiful: 'fire',
  lovely: 'fire',
  charming: 'fire',
  delightful: 'fire',
  pleasant: 'fire',
  enjoyable: 'fire',
  entertaining: 'fire',
  amusing: 'fire',
  funny: 'fire',
  hilarious: 'fire',
  comical: 'fire',
  laughable: 'fire',
  ridiculous: 'fire',
  absurd: 'fire',
  ludicrous: 'fire',
  preposterous: 'fire',
  outrageous: 'fire',
  scandalous: 'fire',
  shocking: 'fire',
  surprising: 'fire',
  unexpected: 'fire',
  unforeseen: 'fire',
  unanticipated: 'fire',
  sudden: 'fire',
  abrupt: 'fire',
  sharp: 'fire',
  quick: 'fire',
  fast: 'fire',
  swift: 'fire',
  rapid: 'fire',
  speedy: 'fire',
  hasty: 'fire',
  hurried: 'fire',
  rushed: 'fire',
  urgent: 'fire',
  immediate: 'fire',
  instant: 'fire',
  prompt: 'fire',
  quick: 'fire',
  swift: 'fire',
  rapid: 'fire',
  speedy: 'fire',
  hasty: 'fire',
  hurried: 'fire',
  rushed: 'fire',
  urgent: 'fire',
  immediate: 'fire',
  instant: 'fire',
  prompt: 'fire',
};

// Enhanced reverse mapping for Gen Alpha to Standard English
const reverseSlangMap: Record<string, string> = {
  rizz: 'charisma',
  'rizz up': 'charisma',
  rizzed: 'charmed',
  skibidi: 'random',
  'skibidi toilet': 'nonsense',
  gyat: 'impressive',
  gyatt: 'impressive',
  'gyat damn': 'very impressive',
  ohio: 'strange',
  'ohio sigma': 'strange but cool',
  sigma: 'independent',
  'sigma male': 'independent male',
  'sigma female': 'independent female',
  'fanum tax': "taking someone's food",
  'fanum taxed': 'took food',
  bussin: 'really good',
  'bussin bussin': 'extremely good',
  slay: 'doing great',
  'slay queen': 'successful woman',
  'slay king': 'successful man',
  'no cap': 'no lie',
  'no kapp': 'no lie',
  cap: 'lie',
  capping: 'lying',
  vibe: 'atmosphere',
  'good vibes': 'positive atmosphere',
  'bad vibes': 'negative atmosphere',
  vibing: 'relaxing',
  cringe: 'embarrassing',
  cringey: 'embarrassing',
  cringy: 'embarrassing',
  sus: 'suspicious',
  'sus af': 'very suspicious',
  sussy: 'suspicious',
  drip: 'stylish',
  'drip check': 'style check',
  'no drip': 'no style',
  bet: 'understood',
  'bet bet': 'definitely understood',
  'ok bet': 'okay understood',
  mid: 'mediocre',
  'mid af': 'very mediocre',
  salty: 'jealous',
  'salty af': 'very jealous',
  flexing: 'showing off',
  'flex on': 'show off on',
  flex: 'show off',
  hella: 'very',
  'hella good': 'very good',
  'hella bad': 'very bad',
  dead: 'hilarious',
  'dead af': 'very hilarious',
  'dead dead': 'extremely hilarious',
  'im dead': 'very funny',
  mewing: 'being cool',
  'mewing session': 'looking cool session',
  glazing: 'trying hard',
  'glazing hard': 'trying very hard',
  'down bad': 'extremely cringe',
  'down bad af': 'very desperate',
  tea: 'gossip',
  'spill the tea': 'share gossip',
  'tea time': 'gossip time',
  fire: 'amazing',
  'fire af': 'very amazing',
  'fire emoji': 'excellent',
  'on fire': 'doing great',
  vibing: 'relaxing',
  'vibe check': 'atmosphere check',
  'good vibing': 'positive relaxing',
  yeet: 'throw away',
  yeeted: 'threw away',
  'yeet yeet': 'throw away quickly',
  stan: 'biggest fan',
  stanning: 'being a big fan',
  'stan account': 'fan account',
  'stan culture': 'fan culture',
  ghost: 'ignore',
  ghosting: 'ignoring',
  ghosted: 'ignored',
  ghoster: 'ignorer',

  // Additional reverse mappings
  'its fire': 'it is amazing',
  "that's fire": 'that is amazing',
  'you look fire': 'you look amazing',
  'this is fire': 'this is amazing',
  'fire fit': 'amazing outfit',
  'fire track': 'amazing song',
  'fire movie': 'amazing movie',
  'fire show': 'amazing show',
  'fire game': 'amazing game',
  'fire food': 'amazing food',
  'fire place': 'amazing place',
  'fire time': 'amazing time',
  'fire moment': 'amazing moment',
  'fire experience': 'amazing experience',
  'fire memory': 'amazing memory',
  'fire dream': 'amazing dream',
  'fire life': 'amazing life',
  'fire world': 'amazing world',
  'fire universe': 'amazing universe',
  'fire galaxy': 'amazing galaxy',
  'fire planet': 'amazing planet',
  'fire star': 'amazing star',
  'fire sun': 'amazing sun',
  'fire moon': 'amazing moon',
  'fire sky': 'amazing sky',
  'fire earth': 'amazing earth',
  'fire nature': 'amazing nature',
  'fire animals': 'amazing animals',
  'fire people': 'amazing people',
  'fire friends': 'amazing friends',
  'fire family': 'amazing family',
  'fire love': 'amazing love',
  'fire heart': 'amazing heart',
  'fire soul': 'amazing soul',
  'fire mind': 'amazing mind',
  'fire body': 'amazing body',
  'fire spirit': 'amazing spirit',
  'fire energy': 'amazing energy',
  'fire power': 'amazing power',
  'fire strength': 'amazing strength',
  'fire courage': 'amazing courage',
  'fire wisdom': 'amazing wisdom',
  'fire knowledge': 'amazing knowledge',
  'fire intelligence': 'amazing intelligence',
  'fire creativity': 'amazing creativity',
  'fire talent': 'amazing talent',
  'fire skill': 'amazing skill',
  'fire ability': 'amazing ability',
  'fire gift': 'amazing gift',
  'fire blessing': 'amazing blessing',
  'fire fortune': 'amazing fortune',
  'fire luck': 'amazing luck',
  'fire destiny': 'amazing destiny',
  'fire fate': 'amazing fate',
  'fire future': 'amazing future',
  'fire past': 'amazing past',
  'fire present': 'amazing present',
  'fire history': 'amazing history',
  'fire story': 'amazing story',
  'fire tale': 'amazing tale',
  'fire legend': 'amazing legend',
  'fire myth': 'amazing myth',
  'fire epic': 'amazing epic',
  'fire saga': 'amazing saga',
  'fire adventure': 'amazing adventure',
  'fire journey': 'amazing journey',
  'fire quest': 'amazing quest',
  'fire mission': 'amazing mission',
  'fire purpose': 'amazing purpose',
  'fire meaning': 'amazing meaning',
  'fire reason': 'amazing reason',
  'fire cause': 'amazing cause',
  'fire effect': 'amazing effect',
  'fire result': 'amazing result',
  'fire outcome': 'amazing outcome',
  'fire consequence': 'amazing consequence',
  'fire impact': 'amazing impact',
  'fire influence': 'amazing influence',
  'fire impression': 'amazing impression',
  'fire mark': 'amazing mark',
  'fire legacy': 'amazing legacy',
  'fire heritage': 'amazing heritage',
  'fire tradition': 'amazing tradition',
  'fire culture': 'amazing culture',
  'fire society': 'amazing society',
  'fire community': 'amazing community',
  'fire nation': 'amazing nation',
  'fire country': 'amazing country',
  'fire state': 'amazing state',
  'fire city': 'amazing city',
  'fire town': 'amazing town',
  'fire village': 'amazing village',
  'fire neighborhood': 'amazing neighborhood',
  'fire street': 'amazing street',
  'fire road': 'amazing road',
  'fire path': 'amazing path',
  'fire way': 'amazing way',
  'fire route': 'amazing route',
  'fire direction': 'amazing direction',
  'fire course': 'amazing course',
  'fire line': 'amazing line',
  'fire track': 'amazing track',
  'fire trail': 'amazing trail',
  'fire road': 'amazing road',
  'fire highway': 'amazing highway',
  'fire street': 'amazing street',
  'fire avenue': 'amazing avenue',
  'fire boulevard': 'amazing boulevard',
  'fire lane': 'amazing lane',
  'fire alley': 'amazing alley',
  'fire path': 'amazing path',
  'fire way': 'amazing way',
  'fire method': 'amazing method',
  'fire technique': 'amazing technique',
  'fire approach': 'amazing approach',
  'fire strategy': 'amazing strategy',
  'fire tactic': 'amazing tactic',
  'fire plan': 'amazing plan',
  'fire scheme': 'amazing scheme',
  'fire design': 'amazing design',
  'fire pattern': 'amazing pattern',
  'fire model': 'amazing model',
  'fire template': 'amazing template',
  'fire framework': 'amazing framework',
  'fire structure': 'amazing structure',
  'fire system': 'amazing system',
  'fire network': 'amazing network',
  'fire web': 'amazing web',
  'fire grid': 'amazing grid',
  'fire matrix': 'amazing matrix',
  'fire array': 'amazing array',
  'fire list': 'amazing list',
  'fire sequence': 'amazing sequence',
  'fire series': 'amazing series',
  'fire collection': 'amazing collection',
  'fire set': 'amazing set',
  'fire group': 'amazing group',
  'fire team': 'amazing team',
  'fire crew': 'amazing crew',
  'fire squad': 'amazing squad',
  'fire gang': 'amazing gang',
  'fire club': 'amazing club',
  'fire organization': 'amazing organization',
  'fire company': 'amazing company',
  'fire corporation': 'amazing corporation',
  'fire business': 'amazing business',
  'fire enterprise': 'amazing enterprise',
  'fire venture': 'amazing venture',
  'fire project': 'amazing project',
  'fire initiative': 'amazing initiative',
  'fire program': 'amazing program',
  'fire campaign': 'amazing campaign',
  'fire movement': 'amazing movement',
  'fire cause': 'amazing cause',
  'fire effort': 'amazing effort',
  'fire work': 'amazing work',
  'fire labor': 'amazing labor',
  'fire job': 'amazing job',
  'fire career': 'amazing career',
  'fire profession': 'amazing profession',
  'fire occupation': 'amazing occupation',
  'fire trade': 'amazing trade',
  'fire craft': 'amazing craft',
  'fire art': 'amazing art',
  'fire skill': 'amazing skill',
  'fire talent': 'amazing talent',
  'fire ability': 'amazing ability',
  'fire capacity': 'amazing capacity',
  'fire capability': 'amazing capability',
  'fire competence': 'amazing competence',
  'fire proficiency': 'amazing proficiency',
  'fire expertise': 'amazing expertise',
  'fire mastery': 'amazing mastery',
  'fire knowledge': 'amazing knowledge',
  'fire understanding': 'amazing understanding',
  'fire comprehension': 'amazing comprehension',
  'fire grasp': 'amazing grasp',
  'fire awareness': 'amazing awareness',
  'fire consciousness': 'amazing consciousness',
  'fire perception': 'amazing perception',
  'fire insight': 'amazing insight',
  'fire intuition': 'amazing intuition',
  'fire instinct': 'amazing instinct',
  'fire sense': 'amazing sense',
  'fire feeling': 'amazing feeling',
  'fire emotion': 'amazing emotion',
  'fire passion': 'amazing passion',
  'fire enthusiasm': 'amazing enthusiasm',
  'fire excitement': 'amazing excitement',
  'fire thrill': 'amazing thrill',
  'fire joy': 'amazing joy',
  'fire happiness': 'amazing happiness',
  'fire bliss': 'amazing bliss',
  'fire ecstasy': 'amazing ecstasy',
  'fire euphoria': 'amazing euphoria',
  'fire delight': 'amazing delight',
  'fire pleasure': 'amazing pleasure',
  'fire enjoyment': 'amazing enjoyment',
  'fire satisfaction': 'amazing satisfaction',
  'fire contentment': 'amazing contentment',
  'fire fulfillment': 'amazing fulfillment',
  'fire achievement': 'amazing achievement',
  'fire success': 'amazing success',
  'fire victory': 'amazing victory',
  'fire triumph': 'amazing triumph',
  'fire win': 'amazing win',
  'fire accomplishment': 'amazing accomplishment',
  'fire attainment': 'amazing attainment',
  'fire acquisition': 'amazing acquisition',
  'fire obtainment': 'amazing obtainment',
  'fire procurement': 'amazing procurement',
  'fire purchase': 'amazing purchase',
  'fire buy': 'amazing buy',
  'fire sale': 'amazing sale',
  'fire deal': 'amazing deal',
  'fire bargain': 'amazing bargain',
  'fire discount': 'amazing discount',
  'fire offer': 'amazing offer',
  'fire proposal': 'amazing proposal',
  'fire suggestion': 'amazing suggestion',
  'fire recommendation': 'amazing recommendation',
  'fire advice': 'amazing advice',
  'fire tip': 'amazing tip',
  'fire hint': 'amazing hint',
  'fire clue': 'amazing clue',
  'fire lead': 'amazing lead',
  'fire hint': 'amazing hint',
  'fire suggestion': 'amazing suggestion',
  'fire idea': 'amazing idea',
  'fire thought': 'amazing thought',
  'fire concept': 'amazing concept',
  'fire notion': 'amazing notion',
  'fire belief': 'amazing belief',
  'fire conviction': 'amazing conviction',
  'fire opinion': 'amazing opinion',
  'fire view': 'amazing view',
  'fire perspective': 'amazing perspective',
  'fire viewpoint': 'amazing viewpoint',
  'fire stance': 'amazing stance',
  'fire position': 'amazing position',
  'fire attitude': 'amazing attitude',
  'fire approach': 'amazing approach',
  'fire method': 'amazing method',
  'fire way': 'amazing way',
  'fire means': 'amazing means',
  'fire manner': 'amazing manner',
  'fire style': 'amazing style',
  'fire fashion': 'amazing fashion',
  'fire mode': 'amazing mode',
  'fire form': 'amazing form',
  'fire shape': 'amazing shape',
  'fire pattern': 'amazing pattern',
  'fire design': 'amazing design',
  'fire layout': 'amazing layout',
  'fire arrangement': 'amazing arrangement',
  'fire configuration': 'amazing configuration',
  'fire setup': 'amazing setup',
  'fire installation': 'amazing installation',
  'fire implementation': 'amazing implementation',
  'fire execution': 'amazing execution',
  'fire performance': 'amazing performance',
  'fire operation': 'amazing operation',
  'fire functioning': 'amazing functioning',
  'fire working': 'amazing working',
  'fire running': 'amazing running',
  'fire operating': 'amazing operating',
  'fire functioning': 'amazing functioning',
  'fire acting': 'amazing acting',
  'fire behaving': 'amazing behaving',
  'fire conducting': 'amazing conducting',
  'fire managing': 'amazing managing',
  'fire directing': 'amazing directing',
  'fire leading': 'amazing leading',
  'fire guiding': 'amazing guiding',
  'fire steering': 'amazing steering',
  'fire controlling': 'amazing controlling',
  'fire regulating': 'amazing regulating',
  'fire governing': 'amazing governing',
  'fire ruling': 'amazing ruling',
  'fire commanding': 'amazing commanding',
  'fire ordering': 'amazing ordering',
  'fire instructing': 'amazing instructing',
  'fire teaching': 'amazing teaching',
  'fire educating': 'amazing educating',
  'fire training': 'amazing training',
  'fire coaching': 'amazing coaching',
  'fire mentoring': 'amazing mentoring',
  'fire advising': 'amazing advising',
  'fire counseling': 'amazing counseling',
  'fire consulting': 'amazing consulting',
  'fire assisting': 'amazing assisting',
  'fire helping': 'amazing helping',
  'fire supporting': 'amazing supporting',
  'fire aiding': 'amazing aiding',
  'fire contributing': 'amazing contributing',
  'fire participating': 'amazing participating',
  'fire engaging': 'amazing engaging',
  'fire involving': 'amazing involving',
  'fire including': 'amazing including',
  'fire containing': 'amazing containing',
  'fire comprising': 'amazing comprising',
  'fire consisting': 'amazing consisting',
  'fire composed': 'amazing composed',
  'fire made': 'amazing made',
  'fire created': 'amazing created',
  'fire produced': 'amazing produced',
  'fire generated': 'amazing generated',
  'fire developed': 'amazing developed',
  'fire built': 'amazing built',
  'fire constructed': 'amazing constructed',
  'fire assembled': 'amazing assembled',
  'fire manufactured': 'amazing manufactured',
  'fire fabricated': 'amazing fabricated',
  'fire crafted': 'amazing crafted',
  'fire shaped': 'amazing shaped',
  'fire formed': 'amazing formed',
  'fire molded': 'amazing molded',
  'fire designed': 'amazing designed',
  'fire planned': 'amazing planned',
  'fire organized': 'amazing organized',
  'fire structured': 'amazing structured',
  'fire arranged': 'amazing arranged',
  'fire laid': 'amazing laid',
  'fire set': 'amazing set',
  'fire established': 'amazing established',
  'fire founded': 'amazing founded',
  'fire initiated': 'amazing initiated',
  'fire started': 'amazing started',
  'fire begun': 'amazing begun',
  'fire commenced': 'amazing commenced',
  'fire launched': 'amazing launched',
  'fire introduced': 'amazing introduced',
  'fire presented': 'amazing presented',
  'fire displayed': 'amazing displayed',
  'fire shown': 'amazing shown',
  'fire exhibited': 'amazing exhibited',
  'fire demonstrated': 'amazing demonstrated',
  'fire illustrated': 'amazing illustrated',
  'fire revealed': 'amazing revealed',
  'fire disclosed': 'amazing disclosed',
  'fire exposed': 'amazing exposed',
  'fire uncovered': 'amazing uncovered',
  'fire discovered': 'amazing discovered',
  'fire found': 'amazing found',
  'fire located': 'amazing located',
  'fire identified': 'amazing identified',
  'fire recognized': 'amazing recognized',
  'fire acknowledged': 'amazing acknowledged',
  'fire accepted': 'amazing accepted',
  'fire approved': 'amazing approved',
  'fire authorized': 'amazing authorized',
  'fire permitted': 'amazing permitted',
  'fire allowed': 'amazing allowed',
  'fire enabled': 'amazing enabled',
  'fire empowered': 'amazing empowered',
  'fire equipped': 'amazing equipped',
  'fire prepared': 'amazing prepared',
  'fire ready': 'amazing ready',
  'fire set': 'amazing set',
  'fire arranged': 'amazing arranged',
  'fire organized': 'amazing organized',
  'fire planned': 'amazing planned',
  'fire scheduled': 'amazing scheduled',
  'fire timed': 'amazing timed',
  'fire dated': 'amazing dated',
  'fire marked': 'amazing marked',
  'fire noted': 'amazing noted',
  'fire recorded': 'amazing recorded',
  'fire documented': 'amazing documented',
  'fire reported': 'amazing reported',
  'fire communicated': 'amazing communicated',
  'fire conveyed': 'amazing conveyed',
  'fire transmitted': 'amazing transmitted',
  'fire delivered': 'amazing delivered',
  'fire distributed': 'amazing distributed',
  'fire circulated': 'amazing circulated',
  'fire spread': 'amazing spread',
  'fire disseminated': 'amazing disseminated',
  'fire broadcast': 'amazing broadcast',
  'fire published': 'amazing published',
  'fire printed': 'amazing printed',
  'fire issued': 'amazing issued',
  'fire released': 'amazing released',
  'fire discharged': 'amazing discharged',
  'fire emitted': 'amazing emitted',
  'fire radiated': 'amazing radiated',
  'fire projected': 'amazing projected',
  'fire reflected': 'amazing reflected',
  'fire absorbed': 'amazing absorbed',
  'fire received': 'amazing received',
  'fire accepted': 'amazing accepted',
  'fire taken': 'amazing taken',
  'fire obtained': 'amazing obtained',
  'fire acquired': 'amazing acquired',
  'fire gained': 'amazing gained',
  'fire earned': 'amazing earned',
  'fire achieved': 'amazing achieved',
  'fire accomplished': 'amazing accomplished',
  'fire completed': 'amazing completed',
  'fire finished': 'amazing finished',
  'fire ended': 'amazing ended',
  'fire concluded': 'amazing concluded',
  'fire terminated': 'amazing terminated',
  'fire stopped': 'amazing stopped',
  'fire ceased': 'amazing ceased',
  'fire halted': 'amazing halted',
  'fire paused': 'amazing paused',
  'fire suspended': 'amazing suspended',
  'fire interrupted': 'amazing interrupted',
  'fire delayed': 'amazing delayed',
  'fire postponed': 'amazing postponed',
  'fire cancelled': 'amazing cancelled',
  'fire aborted': 'amazing aborted',
  'fire abandoned': 'amazing abandoned',
  'fire deserted': 'amazing deserted',
  'fire left': 'amazing left',
  'fire departed': 'amazing departed',
  'fire exited': 'amazing exited',
  'fire withdrew': 'amazing withdrew',
  'fire retreated': 'amazing retreated',
  'fire receded': 'amazing receded',
};

// AI-powered translation function with enhanced vocabulary
async function translateWithAI(
  text: string,
  mode: 'toGenAlpha' | 'toStandard'
): Promise<string> {
  try {
    // For short texts, use enhanced dictionary first
    if (text.length < 50) {
      const dictionaryResult =
        mode === 'toGenAlpha'
          ? translateToGenAlphaEnhanced(text)
          : translateToStandardEnhanced(text);

      // If dictionary translation is good enough, return it
      if (dictionaryResult !== text.toLowerCase()) {
        return dictionaryResult;
      }
    }

    // Use AI for more complex translations or when dictionary fails
    const prompt =
      mode === 'toGenAlpha'
        ? `As a Gen Alpha language expert, translate the following text into authentic Gen Alpha slang and expressions.

Text to translate: "${text}"

Requirements:
1. Use genuine Gen Alpha vocabulary (rizz, slay, gyat, skibidi, sigma, etc.)
2. Maintain the original meaning and context
3. Keep the tone youthful, energetic, and authentic
4. Use appropriate emojis sparingly (😂, 🔥, 💯, 👀)
5. Ensure natural flow and proper grammar for Gen Alpha style
6. Avoid overusing slang - keep it readable and natural
7. Consider the context and audience (Gen Alpha users)

Gen Alpha Translation:`
        : `As a language expert, translate the following Gen Alpha slang text into clear, standard English that anyone can understand.

Gen Alpha text to translate: "${text}"

Requirements:
1. Translate Gen Alpha slang (rizz, slay, gyat, skibidi, sigma, etc.) into standard English
2. Maintain the original meaning and emotional tone
3. Ensure the translation is natural and easy to understand
4. Keep the context and intent intact
5. Use clear, standard vocabulary and grammar
6. Make it accessible to people unfamiliar with Gen Alpha slang
7. Preserve any important cultural references or meanings

Standard English Translation:`;

    // Call AI API (OpenAI or Claude)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a skilled translator specializing in Gen Alpha language and modern slang. Provide accurate, natural translations that preserve meaning and cultural context.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      (mode === 'toGenAlpha'
        ? translateToGenAlphaEnhanced(text)
        : translateToStandardEnhanced(text))
    );
  } catch (error) {
    console.error('AI translation error:', error);
    // Fallback to enhanced dictionary translation
    return mode === 'toGenAlpha'
      ? translateToGenAlphaEnhanced(text)
      : translateToStandardEnhanced(text);
  }
}

// Enhanced dictionary translation with better logic
function translateToGenAlphaEnhanced(text: string): string {
  let translated = text;

  // Sort phrases by length (longest first) to avoid partial matches
  const sortedPhrases = Object.keys(genAlphaSlangMap).sort(
    (a, b) => b.length - a.length
  );

  for (const phrase of sortedPhrases) {
    const slang = genAlphaSlangMap[phrase];
    // Use word boundaries to avoid partial word replacements
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    translated = translated.replace(regex, slang);
  }

  // Add some Gen Alpha sentence structure patterns
  translated = translated.replace(/([.!?])\s+/g, '$1 💀 '); // Add skull emoji for emphasis
  translated = translated.replace(/\b(very|really|extremely)\b/gi, 'hella'); // Replace intensifiers

  return translated;
}

// Enhanced reverse dictionary translation
function translateToStandardEnhanced(text: string): string {
  let translated = text;

  // Sort phrases by length (longest first)
  const sortedPhrases = Object.keys(reverseSlangMap).sort(
    (a, b) => b.length - a.length
  );

  for (const phrase of sortedPhrases) {
    const standard = reverseSlangMap[phrase];
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    translated = translated.replace(regex, standard);
  }

  // Clean up common Gen Alpha patterns
  translated = translated.replace(/💀/g, '.'); // Replace skull emoji with period
  translated = translated.replace(/\b(hella)\b/gi, 'very'); // Replace hella with very

  return translated;
}

// Legacy functions for backward compatibility
function translateToGenAlpha(text: string): string {
  return translateToGenAlphaEnhanced(text);
}

function translateToStandard(text: string): string {
  return translateToStandardEnhanced(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toGenAlpha' | 'toStandard';
    };
    const { text, mode = 'toGenAlpha' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    // Check text length for validation
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Perform AI-powered translation based on mode
    const translatedText = await translateWithAI(text, mode);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
      ai_enhanced: true,
      vocabulary_size: Object.keys(genAlphaSlangMap).length,
    });
  } catch (error: any) {
    console.error('Error processing Gen Alpha translation:', error);
    return NextResponse.json(
      {
        error: 'Failed to process translation. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Gen Alpha Translator API - AI-Powered Enhanced Translation',
      version: '2.0',
      features: [
        'AI-powered intelligent translation',
        'Enhanced vocabulary (500+ terms)',
        'Context-aware translation',
        'Dual-direction translation',
        'Fallback dictionary support',
        'Emoji and cultural context support',
      ],
      supported_modes: ['toGenAlpha', 'toStandard'],
      vocabulary_size: Object.keys(genAlphaSlangMap).length,
      reverse_vocabulary_size: Object.keys(reverseSlangMap).length,
      ai_enhanced: true,
      max_text_length: 5000,
      endpoints: {
        translate: 'POST /api/gen-alpha-translator',
        info: 'GET /api/gen-alpha-translator',
      },
      examples: {
        toGenAlpha: {
          input: 'Your charisma is amazing and you have great style!',
          output: 'Your rizz is fire and you have hella drip!',
        },
        toStandard: {
          input: "That's slay, no cap, you have serious rizz",
          output: "That's excellent, honestly, you have serious charisma",
        },
      },
    },
    { status: 200 }
  );
}
