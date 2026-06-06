/* ============================================================
   THE MEMORY LAB — content + challenge data
   Plain <script> (no modules) so it runs from file:// by double-click.
   ============================================================ */

/* Stage metadata drives the sidebar + progression.
   `kind` maps to a renderer in app.js. */
const STAGES = [
  { id:'intro',        num:1, label:'The Amnesia Problem',  tag:'Feel it',     kind:'intro' },
  { id:'ladder',       num:2, label:'The Storage Ladder',   tag:'Decide',      kind:'ladder' },
  { id:'stakes',       num:3, label:'$10 or $100,000',      tag:'Why it pays', kind:'stakes' },
  { id:'entities',     num:4, label:'Spot the Entity',      tag:'CRUD test',   kind:'sorter' },
  { id:'relationships',num:5, label:'Connect the Dots',     tag:'Relations',   kind:'match' },
  { id:'keys',         num:6, label:'Follow the Key',       tag:'PK & FK',     kind:'keys' },
  { id:'studio',       num:7, label:'The Schema Studio',    tag:'Build it',    kind:'studio' },
  { id:'arena',        num:8, label:'The Arena',            tag:'Challenge',   kind:'arena' },
];

/* ---------- Stage 4: entity-vs-attribute sorter ---------- */
/* Each item: can you Create/Read/Update/Delete it as its OWN thing?
   If yes -> entity. If it only describes another thing -> attribute. */
const SORTER_ITEMS = [
  { t:'User',              answer:'entity', why:'You can create, update & delete a user' },
  { t:'Post',              answer:'entity', why:'A post is created and deleted on its own' },
  { t:'Conversation',      answer:'entity', why:'Starts, gets renamed, gets cleared' },
  { t:'Screenshot',        answer:'entity', why:'You can upload one and delete one' },
  { t:'style of writing',  answer:'attribute', why:'It only describes a post' },
  { t:'email',             answer:'attribute', why:'It describes a user' },
  { t:'created_at date',   answer:'attribute', why:'It describes when a row was made' },
  { t:'tone (formal/casual)', answer:'attribute', why:'A property of a post' },
  { t:'designation',       answer:'attribute', why:'It describes a user' },
  { t:'Message',           answer:'entity', why:'Each message is its own row you can delete' },
];

/* ---------- Stage 5: relationship matcher ---------- */
const MATCH_ROWS = [
  { scn:'A <b>user</b> has exactly one <b>profile</b>.', answer:'1-1' },
  { scn:'A <b>user</b> writes many <b>posts</b>; each post has one author.', answer:'1-many' },
  { scn:'A <b>conversation</b> contains many <b>messages</b>.', answer:'1-many' },
  { scn:'A <b>screenshot</b> can be used in many <b>posts</b>, and a post can use many screenshots.', answer:'many-many' },
  { scn:'A <b>student</b> enrolls in many <b>courses</b>; a course has many students.', answer:'many-many' },
  { scn:'A <b>country</b> has one <b>capital city</b>.', answer:'1-1' },
];
const MATCH_OPTIONS = [
  { v:'1-1',   label:'One-to-one' },
  { v:'1-many',label:'One-to-many' },
  { v:'many-many', label:'Many-to-many' },
];

/* ---------- Stage 6: keys quiz ---------- */
const KEYS_QUESTIONS = [
  {
    q:'“One conversation has many messages.” Which table should hold the foreign key?',
    options:['conversations gets a message_id','messages gets a conversation_id','both need each other\'s id','neither — relationships are automatic'],
    answer:1,
    explain:'The FK always lives on the “many” side. Each message points UP to its one conversation with a <code>conversation_id</code>. A conversation can\'t hold one message_id because it has many.'
  },
  {
    q:'A <code>primary key</code> is best described as…',
    options:['the most important column','the unique address of a row','a column that can repeat','the first column you create'],
    answer:1,
    explain:'A primary key (usually <code>id</code>) is a unique address — like WHERE in your API contract, it points at exactly one row.'
  },
  {
    q:'Trace it: <code>messages.conversation_id = 7</code>, and <code>conversations.user_id = 1</code>. Who does message 31 ultimately belong to?',
    options:['conversation 31','user 7','user 1','nobody — ids are random'],
    answer:2,
    explain:'Message 31 → conversation 7 → user 1. Foreign keys chain rows together. That chain IS the one-to-many relationship.'
  },
  {
    q:'For a many-to-many (screenshots ↔ posts), what do you add?',
    options:['a screenshot_id column on posts','a third “join” table holding both ids','nothing, it just works','two foreign keys on the users table'],
    answer:1,
    explain:'Many-to-many needs a third table (a join/junction table) with one FK to each side — e.g. <code>post_screenshots(post_id, screenshot_id)</code>.'
  },
];

/* ============================================================
   THE ARENA — LeetCode-style domain-modeling problems.
   Each challenge declares a RUBRIC the grader checks the
   student's built schema against. Names are matched fuzzily
   (lowercase, singular/plural, synonyms).
   ============================================================ */
const CHALLENGES = [
  {
    id:'library',
    difficulty:'easy',
    title:'The Neighbourhood Library',
    story:`A tiny local library wants to ditch its paper logbook. Members borrow books. Each book can be borrowed many times (one copy, one member at a time), and a member can borrow many books over the years. The librarian needs to answer: “who has this book right now?” and “what has this member borrowed?”`,
    reqs:[
      'Track members and the books on the shelf.',
      'Record each borrowing event (who took what, and when).',
      'Be able to find every loan for a given member or a given book.',
    ],
    starter:['members','books','loans'],
    rubric:{
      entities:[
        { name:'members', aliases:['member','users','user','people','person'],
          attrs:[
            {name:'id', role:'pk'},
            {name:'name', aliases:['full_name','member_name']},
            {name:'email', required:false, aliases:['contact','phone']},
          ]},
        { name:'books', aliases:['book','titles','title'],
          attrs:[
            {name:'id', role:'pk'},
            {name:'title', aliases:['name','book_title']},
            {name:'author', required:false},
          ]},
        { name:'loans', aliases:['loan','borrowings','borrowing','checkouts','checkout','borrow_records'],
          attrs:[
            {name:'id', role:'pk'},
            {name:'member_id', role:'fk', ref:'members'},
            {name:'book_id', role:'fk', ref:'books'},
            {name:'borrowed_at', required:false, aliases:['date','loan_date','borrowed_date','created_at','due_date']},
          ]},
      ],
      relationships:[
        { label:'one member → many loans', fk:{table:'loans', ref:'members'} },
        { label:'one book → many loans', fk:{table:'loans', ref:'books'} },
      ],
    },
    hints:[
      'A “loan” is an event — it happens, so you can Create and Delete it. That passes the CRUD test, so it deserves its own table.',
      'Don\'t put a borrowed_by name column on books. The same book gets borrowed many times — that\'s the “many” side, so it needs its own rows in loans.',
      'The loans table is where both foreign keys live: one pointing at members, one pointing at books.',
    ],
  },

  {
    id:'swiggy',
    difficulty:'medium',
    title:'Late-Night Food Delivery',
    story:`You're modeling a Swiggy-style app. Customers place orders from restaurants. A restaurant has a menu of dishes. An order is for one restaurant but can contain several dishes (2 biryanis + 1 coke). You must be able to show a customer's order history and, for each order, the exact dishes and quantities.`,
    reqs:[
      'Customers, restaurants, and the dishes each restaurant offers.',
      'Orders placed by a customer at one restaurant.',
      'The line-items of an order: which dishes, and how many of each.',
      'Answer: “show every dish in order #42 with its quantity.”',
    ],
    starter:['customers','restaurants','dishes','orders','order_items'],
    rubric:{
      entities:[
        { name:'customers', aliases:['customer','users','user'],
          attrs:[{name:'id',role:'pk'},{name:'name'},{name:'address',required:false,aliases:['phone','email']}]},
        { name:'restaurants', aliases:['restaurant','vendors','vendor','stores','store'],
          attrs:[{name:'id',role:'pk'},{name:'name'},{name:'address',required:false,aliases:['cuisine','location']}]},
        { name:'dishes', aliases:['dish','menu_items','menu_item','items','products','product','food'],
          attrs:[
            {name:'id',role:'pk'},
            {name:'name',aliases:['dish_name','title']},
            {name:'price'},
            {name:'restaurant_id',role:'fk',ref:'restaurants'},
          ]},
        { name:'orders', aliases:['order'],
          attrs:[
            {name:'id',role:'pk'},
            {name:'customer_id',role:'fk',ref:'customers'},
            {name:'restaurant_id',role:'fk',ref:'restaurants'},
            {name:'created_at',required:false,aliases:['date','ordered_at','status','total']},
          ]},
        { name:'order_items', aliases:['order_item','order_lines','order_line','line_items','line_item','order_dishes','cart_items'],
          attrs:[
            {name:'id',role:'pk',required:false},
            {name:'order_id',role:'fk',ref:'orders'},
            {name:'dish_id',role:'fk',ref:'dishes'},
            {name:'quantity',aliases:['qty','count']},
          ]},
      ],
      relationships:[
        { label:'one restaurant → many dishes', fk:{table:'dishes', ref:'restaurants'} },
        { label:'one customer → many orders', fk:{table:'orders', ref:'customers'} },
        { label:'one order → many order_items', fk:{table:'order_items', ref:'orders'} },
        { label:'one dish → many order_items', fk:{table:'order_items', ref:'dishes'} },
      ],
    },
    hints:[
      'An order has many dishes AND a dish appears in many orders — that\'s many-to-many. You cannot model it with a single column. You need a join table.',
      'That join table is order_items. Each row = “this order, this dish, this quantity.” Quantity belongs ON the join row, nowhere else.',
      'A dish belongs to exactly one restaurant, so dishes carries a restaurant_id. An order is from one restaurant, so orders also carries restaurant_id.',
    ],
  },

  {
    id:'instagram',
    difficulty:'hard',
    title:'A Photo-Sharing Network',
    story:`Model the core of Instagram. Users post photos. Other users like and comment on those photos. Users also follow each other — and following is not mutual (you can follow someone who doesn't follow you back). You need feeds, like counts, comment threads, and a follower/following list for every user.`,
    reqs:[
      'Users and the posts (photos) they publish.',
      'Comments on posts (a post has many comments).',
      'Likes — a user can like many posts; a post gets many likes; a user likes a given post once.',
      'Follows — a directional user-to-user relationship (follower → followed).',
      'Answer: “how many likes does post #9 have?” and “who does user #3 follow?”',
    ],
    starter:['users','posts','comments','likes','follows'],
    rubric:{
      entities:[
        { name:'users', aliases:['user','accounts','account','members','member'],
          attrs:[{name:'id',role:'pk'},{name:'username',aliases:['name','handle']},{name:'email',required:false,aliases:['bio']}]},
        { name:'posts', aliases:['post','photos','photo','images','image'],
          attrs:[
            {name:'id',role:'pk'},
            {name:'user_id',role:'fk',ref:'users'},
            {name:'image_url',aliases:['url','photo_url','caption','content','media']},
            {name:'created_at',required:false,aliases:['date','posted_at']},
          ]},
        { name:'comments', aliases:['comment'],
          attrs:[
            {name:'id',role:'pk'},
            {name:'post_id',role:'fk',ref:'posts'},
            {name:'user_id',role:'fk',ref:'users'},
            {name:'text',aliases:['content','body','comment_text']},
          ]},
        { name:'likes', aliases:['like','post_likes','reactions','reaction'],
          attrs:[
            {name:'id',role:'pk',required:false},
            {name:'post_id',role:'fk',ref:'posts'},
            {name:'user_id',role:'fk',ref:'users'},
          ]},
        { name:'follows', aliases:['follow','followers','following','friendships','friendship','relationships'],
          attrs:[
            {name:'id',role:'pk',required:false},
            {name:'follower_id',role:'fk',ref:'users',aliases:['follower','from_user_id','user_id']},
            {name:'followed_id',role:'fk',ref:'users',aliases:['followed','following_id','followee_id','to_user_id','target_user_id']},
          ]},
      ],
      relationships:[
        { label:'one user → many posts', fk:{table:'posts', ref:'users'} },
        { label:'one post → many comments', fk:{table:'comments', ref:'posts'} },
        { label:'likes join users ↔ posts', fk:{table:'likes', ref:'posts'} },
        { label:'follows join users ↔ users (self many-to-many)', fk:{table:'follows', ref:'users', selfJoin:true}, weight:16 },
      ],
    },
    hints:[
      'A “like” is the classic many-to-many join: likes(user_id, post_id). One row means “this user liked this post.” Count likes for a post by counting its rows.',
      'Follows is a many-to-many of users with THEMSELVES. The join table needs TWO foreign keys, both pointing at users — follower_id and followed_id — and they must have different names.',
      'Comments are a plain one-to-many from posts (and also carry user_id so you know who wrote each one).',
    ],
  },
];

/* column type options offered in the builder */
const COL_TYPES = ['text','number','date','boolean','id'];
