/* ============================================================
   THE MODELING LAB — content + exercise data
   Plain <script> (no modules) so it runs from file:// by double-click.
   Focus: domain modeling. Minimal theory. One concept per screen.
   ============================================================ */

/* ---- small art helpers (returned as HTML strings) ---- */
function badgeRow(pairs){
  return `<div class="art"><div class="art-card"><div class="kv">${pairs.map(p=>
    `<div class="kv-row"><span class="${p.t==='e'?'entity-badge':'attr-badge'}">${p.t==='e'?'entity':'attribute'}</span><span class="kv-val"><b style="color:var(--fg)">${p.k}</b>${p.v?' — '+p.v:''}</span></div>`).join('')}</div></div></div>`;
}

/* ============================================================
   MODULES — the linear lesson flow
   step types: intro | demo | concept | quiz
   ============================================================ */
const MODULES = [
  /* ---------------- 0. START ---------------- */
  { id:'start', title:'Start here', icon:'sparkles', steps:[
    { t:'intro',
      title:'Model the world,\nthen store it.',
      subtitle:'Your app can think. Now teach it to remember — at scale.',
      body:`Every product you use — chat apps, Swiggy, Instagram — is a set of <b>tables</b> that point at each other. Before anyone writes a database, they do the real work on paper: naming the <b>entities</b>, <b>attributes</b>, and <b>relationships</b> of their world. That skill is <b>domain modeling</b>, and it's what this lab drills into your hands.`,
    },
    { t:'demo' },
    { t:'concept', eyebrow:'The real skill',
      title:'You can\'t store what you can\'t describe.',
      subtitle:'So before any tool, you answer three questions about your world.',
      body:`<b>1. What are the things?</b> (entities — the nouns)<br><b>2. What does each thing have?</b> (attributes)<br><b>3. How do the things connect?</b> (relationships)<br><br>Get these right and the database almost writes itself. Get them wrong and you pay for it forever. Let's build the muscle, one idea at a time.`,
    },
  ]},

  /* ---------------- 1. ENTITIES ---------------- */
  { id:'entities', title:'Entities', icon:'box', steps:[
    { t:'concept', eyebrow:'Concept 1 — entities',
      title:'Entities are the nouns.',
      subtitle:'The core things your app is about.',
      body:`User, Post, Order, Conversation, Message, Book, Pet. Each one becomes its own <b>table</b>. If you can point at it and say "there's one of those, and another one over there," it's probably an entity.`,
      art:badgeRow([{t:'e',k:'User'},{t:'e',k:'Order'},{t:'e',k:'Message'},{t:'e',k:'Book'}]) },
    { t:'concept', eyebrow:'Concept 2 — the test',
      title:'The CRUD test.',
      subtitle:'Can you Create, Read, Update, and Delete it on its own?',
      body:`Ask it of any candidate. Can you create a user, read a user, update a user, delete a user? Yes — so <b>User</b> is an entity. If the thing can't exist by itself, and only <i>describes</i> something else, it's not an entity. It's an attribute (next module).`,
    },
    { t:'quiz', eyebrow:'Quick check', prompt:'Is "Order" an entity?',
      scn:`A customer places an <b>order</b>. You can create it, look it up, change it, cancel it.`,
      options:[
        {label:'Yes — it passes the CRUD test', correct:true, fb:'Exactly. You can create, read, update and delete an order independently, so it earns its own table.'},
        {label:'No — it just describes a customer', correct:false, fb:'An order isn\'t a property of a customer — it stands on its own and you can CRUD it. That makes it an entity.'},
      ] },
    { t:'quiz', eyebrow:'Quick check', prompt:'Is "email address" an entity?',
      scn:`Every user has an <b>email address</b> like aarav@mail.com.`,
      options:[
        {label:'No — it only describes a user', correct:true, fb:'Right. An email can\'t be created or deleted as its own thing; it just describes a user. That\'s an attribute, not an entity.'},
        {label:'Yes — give it its own table', correct:false, fb:'An email has no independent life — it only exists to describe a user. It\'s an attribute. Over-splitting into tables is a common beginner trap.'},
      ] },
    { t:'quiz', eyebrow:'Quick check', prompt:'Is "Comment" an entity?',
      scn:`On a photo app, people leave <b>comments</b> on posts. Each comment can be posted and deleted.`,
      options:[
        {label:'Yes — you can create and delete each one', correct:true, fb:'Yes. A comment is its own row you can create, read and delete — an entity that points back at a post and a user.'},
        {label:'No — it\'s just text on a post', correct:false, fb:'Each comment is independently created and deleted (and has its own author and time), so it\'s an entity — not a mere attribute of a post.'},
      ] },
  ]},

  /* ---------------- 2. ATTRIBUTES ---------------- */
  { id:'attributes', title:'Attributes', icon:'tag', steps:[
    { t:'concept', eyebrow:'Concept — attributes',
      title:'Attributes describe an entity.',
      subtitle:'They\'re the columns of a table.',
      body:`A <b>User</b> has a name, an email, a designation. A <b>Post</b> has content, a tone, a created-at date. Each attribute is one column. An attribute can't stand alone — strip away the user and "email" means nothing.`,
      art:badgeRow([{t:'e',k:'User',v:'the thing'},{t:'a',k:'name',v:'describes the user'},{t:'a',k:'email',v:'describes the user'},{t:'a',k:'designation',v:'describes the user'}]) },
    { t:'concept', eyebrow:'The hard part',
      title:'Drawing the boundary is the skill.',
      subtitle:'"Style of writing" feels important — but is it an entity?',
      body:`No. <code>style_of_writing</code> can't be created or deleted by itself; it only <i>describes</i> a post. So it's an <b>attribute of Post</b>. Meanwhile a <b>screenshot</b> can be uploaded and deleted on its own — so it's an <b>entity</b>. Same sentence, different answers. Arguing this line is exactly the muscle you're building.`,
    },
    { t:'quiz', eyebrow:'Quick check', prompt:'Entity or attribute: "tone"?',
      scn:`An AI writes a LinkedIn post in a chosen <b>tone</b> — formal or casual.`,
      options:[
        {label:'Attribute of Post', correct:true, fb:'Right. Tone is a property of a post — one column. It has no independent existence, so it\'s an attribute.'},
        {label:'Its own entity', correct:false, fb:'Tone only describes a post; you wouldn\'t create or delete a "tone" on its own. It\'s an attribute of Post.'},
      ] },
    { t:'quiz', eyebrow:'Quick check', prompt:'Entity or attribute: "Screenshot"?',
      scn:`Users upload <b>screenshots</b> that can appear inside many different posts.`,
      options:[
        {label:'Its own entity', correct:true, fb:'Yes. You can create and delete a screenshot independently, and it\'s reused across posts — so it deserves its own table.'},
        {label:'Attribute of Post', correct:false, fb:'A screenshot exists on its own and is shared across many posts — that independent life makes it an entity, not a column on Post.'},
      ] },
  ]},

  /* ---------------- 3. RELATIONSHIPS ---------------- */
  { id:'relationships', title:'Relationships', icon:'spline', steps:[
    { t:'concept', eyebrow:'Why databases exist',
      title:'Things connect. That\'s the point.',
      subtitle:'A spreadsheet stores attributes. A database stores attributes AND relationships.',
      body:`A user <i>has many</i> posts. A post <i>belongs to</i> a user. An order <i>contains</i> dishes. These connections are the whole reason relational databases exist — and there are only three shapes to learn.`,
    },
    { t:'concept', eyebrow:'Shape 1',
      title:'One-to-one.',
      subtitle:'Each A has exactly one B.',
      body:`A user has one profile. A country has one capital city. Rare in practice — if you find one, ask whether the two things should just be one table.`,
      art:`<div class="art"><div class="reldiag"><span class="rel-box">User</span><span class="rel-line"><span class="ln"></span>has one<span class="ln"></span></span><span class="rel-box">Profile</span></div></div>` },
    { t:'concept', eyebrow:'Shape 2 — the workhorse',
      title:'One-to-many.',
      subtitle:'One A has many B. This is most of your model.',
      body:`One user has many posts. One conversation has many messages. The "many" side carries a pointer back to the "one" side. Hold that thought — it becomes a <b>foreign key</b> in the Keys module.`,
      art:`<div class="art"><div class="reldiag"><span class="rel-box">Conversation</span><span class="rel-line"><span class="ln"></span>has many<span class="ln"></span></span><span class="rel-box">Messages</span></div></div>` },
    { t:'concept', eyebrow:'Shape 3 — the sneaky one',
      title:'Many-to-many.',
      subtitle:'Many A connect to many B — and it needs a third table.',
      body:`A student takes many courses; a course has many students. You can't express that with a single pointer on either side. You add a <b>join table</b> (also called a junction or associative entity) — one row per connection: <code>enrollments(student_id, course_id)</code>.`,
      art:`<div class="art"><div class="reldiag"><span class="rel-box">Student</span><span class="rel-line"><span class="ln"></span>∞<span class="ln"></span></span><span class="rel-box" style="border-color:var(--accent);color:var(--accent-press)">Enrollment</span><span class="rel-line"><span class="ln"></span>∞<span class="ln"></span></span><span class="rel-box">Course</span></div></div>` },
    { t:'concept', eyebrow:'The key move',
      title:'Where does the in-between data live?',
      subtitle:'On the join table. Not on either side.',
      body:`A student's <b>grade</b> in a course isn't a property of the student (they have many grades) or the course (it has many) — it belongs to the <i>pairing</i>. So <code>grade</code> sits on <code>enrollments</code>. Same with <code>quantity</code> on an order's line-item: it describes the connection, so it lives on the join row. This single idea separates beginners from real modelers.`,
    },
    { t:'quiz', eyebrow:'Name the shape', prompt:'What relationship is this?',
      scn:`A <b>user</b> has exactly one <b>settings profile</b>, and that profile belongs to exactly one user.`,
      options:[
        {label:'One-to-one', correct:true, fb:'Correct — each side has exactly one of the other. One-to-one.'},
        {label:'One-to-many', correct:false, fb:'There\'s only ever one profile per user and one user per profile — that\'s one-to-one.'},
        {label:'Many-to-many', correct:false, fb:'Neither side has "many" here — it\'s strictly one-to-one.'},
      ] },
    { t:'quiz', eyebrow:'Name the shape', prompt:'What relationship is this?',
      scn:`A <b>conversation</b> contains many <b>messages</b>; each message belongs to one conversation.`,
      options:[
        {label:'One-to-many', correct:true, fb:'Yes — one conversation, many messages. The classic one-to-many that powers most apps.'},
        {label:'Many-to-many', correct:false, fb:'A message belongs to just one conversation, so it\'s one-to-many, not many-to-many.'},
        {label:'One-to-one', correct:false, fb:'A conversation holds many messages, so it\'s one-to-many.'},
      ] },
    { t:'quiz', eyebrow:'Name the shape', prompt:'What relationship is this?',
      scn:`A <b>screenshot</b> can appear in many <b>posts</b>, and a post can include many screenshots.`,
      options:[
        {label:'Many-to-many (needs a join table)', correct:true, fb:'Right — both sides are "many", so you need a join table like post_screenshots(post_id, screenshot_id).'},
        {label:'One-to-many', correct:false, fb:'Both directions are "many" here, so a single pointer won\'t work — it\'s many-to-many and needs a join table.'},
        {label:'One-to-one', correct:false, fb:'Each can connect to many of the other — that\'s many-to-many.'},
      ] },
    { t:'quiz', eyebrow:'The key move', prompt:'Where does the "grade" attribute belong?',
      scn:`Students enroll in courses (many-to-many). The university records a <b>grade</b> per student per course.`,
      options:[
        {label:'On the enrollments join table', correct:true, fb:'Exactly. A grade describes the student-course pairing, so it lives on the join row — not on Student or Course.'},
        {label:'On the students table', correct:false, fb:'A student has many grades (one per course), so it can\'t be a single column on students. It belongs on the enrollment.'},
        {label:'On the courses table', correct:false, fb:'A course has many grades (one per student), so it can\'t live on courses. It belongs on the enrollment join row.'},
      ] },
  ]},

  /* ---------------- 4. KEYS → TABLES → ER ---------------- */
  { id:'keys', title:'Keys & ER', icon:'key-round', steps:[
    { t:'concept', eyebrow:'The grammar',
      title:'Tables, rows, columns.',
      subtitle:'The universal grammar — identical in Supabase, Airtable, Sheets, SQLite.',
      body:`A <b>table</b> holds one entity type. A <b>row</b> is one instance of it. A <b>column</b> is one attribute. That's it. A spreadsheet you already understand <i>is</i> a table.`,
    },
    { t:'concept', eyebrow:'Identity',
      title:'A primary key is a row\'s address.',
      subtitle:'Usually just `id`. Unique, points at exactly one row.',
      body:`Give every table an <code>id</code>. It's how anything else can refer to this exact row later — like an apartment number that never repeats in the building.`,
    },
    { t:'concept', eyebrow:'The link',
      title:'A foreign key points at another row.',
      subtitle:'It\'s a column holding another table\'s primary key.',
      body:`"One conversation has many messages" becomes "every message carries the <code>id</code> of its conversation." The pointer lives on the <b>many</b> side. Trace it across tables:`,
      art:`<div class="art"><div class="art-card"><div class="trace"><span class="node">message #31</span><span class="arr">→</span><span class="node">conversation_id 7</span><span class="arr">→</span><span class="node">user_id 1</span></div></div></div>` },
    { t:'quiz', eyebrow:'Place the key', prompt:'Which table gets the foreign key?',
      scn:`One <b>conversation</b> has many <b>messages</b>.`,
      options:[
        {label:'messages gets a conversation_id', correct:true, fb:'Right. The foreign key always lives on the "many" side. Each message points up to its one conversation.'},
        {label:'conversations gets a message_id', correct:false, fb:'A conversation has many messages — it can\'t hold a single message_id. The FK goes on messages (the many side).'},
        {label:'both tables point at each other', correct:false, fb:'You only need the pointer on the many side. One conversation_id per message captures the whole relationship.'},
      ] },
    { t:'concept', eyebrow:'The payoff',
      title:'Your model is just a set of sheets.',
      subtitle:'Boxes for entities, lines for relationships — that\'s an ER diagram. It maps 1:1 to CSV sheets.',
      body:`Every entity is a sheet; every column a header; every foreign key a link between sheets. Now it's time to do it yourself. The Arena gives you real product briefs — model each one, and the lab grades your schema live, the way a senior engineer would in review.`,
    },
  ]},

  /* ---------------- 5. ARENA ---------------- */
  { id:'arena', title:'The Arena', icon:'dumbbell', arena:true, steps:[ { t:'arena' } ] },
];

/* column types offered in the builder */
const COL_TYPES = ['text','number','date','boolean','id'];

/* ============================================================
   THE ARENA — 10 graded modeling exercises, 3 tiers.
   Grader matches names fuzzily (singular/plural + synonyms).
   `critical:true` on an attr/relationship = getting it wrong
   blocks a pass (used for the teaching point of each exercise).
   ============================================================ */
const CHALLENGES = [
  /* ---------- BEGINNER ---------- */
  {
    id:'library', difficulty:'beginner', skill:'one-to-many',
    title:'The Neighbourhood Library',
    blurb:'Members borrow books. Track who has what.',
    story:`A small library wants to ditch its paper logbook. Members borrow books; each borrowing is an event with a date. The librarian needs to answer "who has this book?" and "what has this member borrowed?"`,
    reqs:['Track members and books.','Record each borrowing event (who, what, when).','Find every loan for a member or a book.'],
    starter:['members','books','loans'],
    rubric:{ entities:[
      { name:'members', aliases:['member','users','user','people'], attrs:[{name:'id',role:'pk'},{name:'name',aliases:['full_name']},{name:'membership_id',required:false,aliases:['email','phone']}]},
      { name:'books', aliases:['book','titles'], attrs:[{name:'id',role:'pk'},{name:'title',aliases:['name']},{name:'author',required:false},{name:'isbn',required:false}]},
      { name:'loans', aliases:['loan','borrowings','borrowing','checkouts','borrow_records'], attrs:[{name:'id',role:'pk',required:false},{name:'member_id',role:'fk',ref:'members'},{name:'book_id',role:'fk',ref:'books'},{name:'borrowed_at',required:false,aliases:['date','loan_date','due_date','created_at']}]},
    ], relationships:[
      {label:'one member → many loans', fk:{table:'loans',ref:'members'}},
      {label:'one book → many loans', fk:{table:'loans',ref:'books'}},
    ]},
    hints:['A "loan" is an event — you can create and delete it — so it earns its own table.','Don\'t add a "borrowed_by" column on books; the same book is borrowed many times. That\'s the many side → it needs loan rows.','Both foreign keys live on loans: one → members, one → books.'],
  },
  {
    id:'petclinic', difficulty:'beginner', skill:'one-to-many',
    title:'The Pet Clinic',
    blurb:'Owners and their pets. One owner, many pets.',
    story:`A clinic tracks pet owners and their pets. An owner can have multiple pets, but each pet belongs to exactly one owner.`,
    reqs:['Track owners (name, phone, address).','Track pets (name, species, breed, date of birth).','Model the owner → pet relationship with the foreign key in the right place.'],
    starter:['owners','pets'],
    rubric:{ entities:[
      { name:'owners', aliases:['owner','customers','customer','people'], attrs:[{name:'id',role:'pk'},{name:'name'},{name:'phone',required:false},{name:'address',required:false}]},
      { name:'pets', aliases:['pet','animals','animal'], attrs:[{name:'id',role:'pk'},{name:'name'},{name:'species',required:false},{name:'breed',required:false},{name:'date_of_birth',required:false,aliases:['dob','birth_date']},{name:'owner_id',role:'fk',ref:'owners'}]},
    ], relationships:[
      {label:'one owner → many pets', fk:{table:'pets',ref:'owners'}},
    ]},
    hints:['Two entities only: owners and pets.','"One owner has many pets" → the FK goes on the many side. Put owner_id on pets.','You do NOT put a pet_id on owners — an owner has many pets, so a single pet_id can\'t hold them.'],
  },
  {
    id:'bakery', difficulty:'beginner', skill:'junction table',
    title:'The Corner Bakery',
    blurb:'Orders with multiple items. More than two entities.',
    story:`A bakery takes customer orders. Each order can contain several items — croissants, bread loaves, cakes — each with a quantity. You must show, for any order, the exact items and how many of each.`,
    reqs:['Identify ALL entities (hint: there are more than two).','An order belongs to a customer and contains many items.','Put the quantity in the right place.'],
    starter:['customers','products','orders','order_items'],
    rubric:{ entities:[
      { name:'customers', aliases:['customer','users'], attrs:[{name:'id',role:'pk'},{name:'name'},{name:'phone',required:false}]},
      { name:'products', aliases:['product','items','item','goods','bakery_items','menu'], attrs:[{name:'id',role:'pk'},{name:'name',aliases:['title']},{name:'price',required:false}]},
      { name:'orders', aliases:['order'], attrs:[{name:'id',role:'pk'},{name:'customer_id',role:'fk',ref:'customers'},{name:'created_at',required:false,aliases:['date','ordered_at']}]},
      { name:'order_items', aliases:['order_item','order_lines','line_items','order_products','cart_items'], attrs:[{name:'id',role:'pk',required:false},{name:'order_id',role:'fk',ref:'orders'},{name:'product_id',role:'fk',ref:'products',aliases:['item_id']},{name:'quantity',critical:true,aliases:['qty']}]},
    ], relationships:[
      {label:'one customer → many orders', fk:{table:'orders',ref:'customers'}},
      {label:'one order → many order_items', fk:{table:'order_items',ref:'orders'}},
      {label:'one product → many order_items', fk:{table:'order_items',ref:'products'}},
    ]},
    hints:['An order containing many products, and a product appearing in many orders, is many-to-many → you need a join table (order_items).','Quantity describes the order-product pairing, so it lives ON order_items — not on products or orders.','That\'s four entities: customers, products, orders, order_items.'],
  },
  {
    id:'music', difficulty:'beginner', skill:'entity vs attribute',
    title:'The Music Library',
    blurb:'Don\'t flatten artists and albums into song columns.',
    story:`A streaming app stores songs. A song has a title, duration, and genre. It also has an artist (with a name and country) and an album (with a name and release year). Decide what's an entity and what's an attribute.`,
    reqs:['Pull artist and album OUT of the song into their own entities.','A song belongs to an album; an album belongs to an artist.','Keep genre/duration as attributes of the song.'],
    starter:['artists','albums','songs'],
    rubric:{ entities:[
      { name:'artists', aliases:['artist'], attrs:[{name:'id',role:'pk'},{name:'name',aliases:['artist_name']},{name:'country',required:false}]},
      { name:'albums', aliases:['album'], attrs:[{name:'id',role:'pk'},{name:'name',aliases:['title','album_name']},{name:'release_year',required:false,aliases:['year']},{name:'artist_id',role:'fk',ref:'artists'}]},
      { name:'songs', aliases:['song','tracks','track'], attrs:[{name:'id',role:'pk'},{name:'title',aliases:['name']},{name:'duration',required:false},{name:'genre',required:false},{name:'album_id',role:'fk',ref:'albums'}]},
    ], relationships:[
      {label:'one artist → many albums', fk:{table:'albums',ref:'artists'}},
      {label:'one album → many songs', fk:{table:'songs',ref:'albums'}},
    ]},
    hints:['Artist name and country repeat across every song — that repetition is the signal to extract Artist into its own entity.','Same for album name and release year → an Albums entity.','Then a song just points at its album with album_id, and an album points at its artist with artist_id.'],
  },

  /* ---------- INTERMEDIATE ---------- */
  {
    id:'learning', difficulty:'intermediate', skill:'many-to-many',
    title:'Online Learning Platform',
    blurb:'Courses, instructors, students. Spot the m:n.',
    story:`A platform has courses, instructors, and students. Each course is taught by one instructor, but an instructor can teach many courses. A course has many students, and a student takes many courses.`,
    reqs:['One instructor teaches many courses (one-to-many).','Students and courses are many-to-many — model the join.','Place every foreign key correctly.'],
    starter:['instructors','courses','students','enrollments'],
    rubric:{ entities:[
      { name:'instructors', aliases:['instructor','teachers','teacher'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'courses', aliases:['course','classes','class'], attrs:[{name:'id',role:'pk'},{name:'title',aliases:['name']},{name:'instructor_id',role:'fk',ref:'instructors'}]},
      { name:'students', aliases:['student','learners','learner'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'enrollments', aliases:['enrollment','registrations','enrolments','student_courses','course_students'], attrs:[{name:'id',role:'pk',required:false},{name:'student_id',role:'fk',ref:'students'},{name:'course_id',role:'fk',ref:'courses'}]},
    ], relationships:[
      {label:'one instructor → many courses', fk:{table:'courses',ref:'instructors'}},
      {label:'enrollments join students ↔ courses', fk:{table:'enrollments',ref:'students'}},
      {label:'enrollments join courses ↔ students', fk:{table:'enrollments',ref:'courses'}},
    ]},
    hints:['Instructor→courses is one-to-many: put instructor_id on courses.','Students↔courses is many-to-many: you cannot put course_id on students (a student has many). Add an enrollments join table.','enrollments holds two FKs: student_id and course_id.'],
  },
  {
    id:'university', difficulty:'intermediate', skill:'attribute on junction',
    title:'University Grades',
    blurb:'Where does the grade attribute belong?',
    story:`A university tracks students and courses (many-to-many). Crucially, it records the grade each student receives in each course. Decide exactly where the grade lives.`,
    reqs:['Model students ↔ courses as a join table.','Store the grade per student per course.','Justify the grade\'s placement by where it logically belongs.'],
    starter:['students','courses','enrollments'],
    rubric:{ entities:[
      { name:'students', aliases:['student'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'courses', aliases:['course','classes'], attrs:[{name:'id',role:'pk'},{name:'title',aliases:['name']}]},
      { name:'enrollments', aliases:['enrollment','registrations','grades','student_courses','transcripts','results'], attrs:[{name:'id',role:'pk',required:false},{name:'student_id',role:'fk',ref:'students'},{name:'course_id',role:'fk',ref:'courses'},{name:'grade',critical:true,aliases:['score','marks','result']}]},
    ], relationships:[
      {label:'enrollments join students ↔ courses', fk:{table:'enrollments',ref:'students'}},
      {label:'enrollments join courses ↔ students', fk:{table:'enrollments',ref:'courses'}},
    ]},
    hints:['A student has many grades (one per course); a course has many grades (one per student). So grade can\'t live on either.','It describes the student-course PAIRING → it belongs on the enrollment join row.','Add a grade column to enrollments alongside student_id and course_id.'],
  },
  {
    id:'carrental', difficulty:'intermediate', skill:'contract as entity',
    title:'Car Rental Service',
    blurb:'Cars, customers, and the rental contract between them.',
    story:`A rental service manages cars and customers. A customer can rent many cars over time; a car can be rented under many contracts over time (but only one at a time). A contract records start date, end date, and total cost.`,
    reqs:['Cars (license plate, make, model) and customers.','A rental contract links one car to one customer for a period.','Put the dates and cost on the contract, not the car.'],
    starter:['cars','customers','contracts'],
    rubric:{ entities:[
      { name:'cars', aliases:['car','vehicles','vehicle'], attrs:[{name:'id',role:'pk'},{name:'license_plate',aliases:['plate','registration']},{name:'make',required:false},{name:'model',required:false}]},
      { name:'customers', aliases:['customer','renters','renter','users'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'contracts', aliases:['contract','rentals','rental','bookings','booking','reservations'], attrs:[{name:'id',role:'pk'},{name:'car_id',role:'fk',ref:'cars'},{name:'customer_id',role:'fk',ref:'customers'},{name:'start_date',critical:true,aliases:['start','from_date','rental_start']},{name:'end_date',aliases:['end','to_date','rental_end']},{name:'total_cost',required:false,aliases:['cost','price','amount']}]},
    ], relationships:[
      {label:'one car → many contracts', fk:{table:'contracts',ref:'cars'}},
      {label:'one customer → many contracts', fk:{table:'contracts',ref:'customers'}},
    ]},
    hints:['The rental itself is an entity (a contract) — it can be created and ended, and it carries its own data.','Both car_id and customer_id live on contracts.','Start/end dates and total cost describe the rental period, so they belong on the contract — never on the car.'],
  },
  {
    id:'hospital', difficulty:'intermediate', skill:'historical records',
    title:'Hospital Assignments (with history)',
    blurb:'Track current AND past department assignments.',
    story:`A hospital assigns doctors to departments. Doctors move between departments over time. You must know each doctor's current department AND their full history of assignments.`,
    reqs:['Doctors and departments.','Capture every assignment over time, with dates.','History means an assignment is its own row — not a single column on the doctor.'],
    starter:['doctors','departments','assignments'],
    rubric:{ entities:[
      { name:'doctors', aliases:['doctor','physicians','physician','staff'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'departments', aliases:['department','depts','dept','units','unit','wards'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'assignments', aliases:['assignment','postings','posting','doctor_departments','allocations','placements'], attrs:[{name:'id',role:'pk',required:false},{name:'doctor_id',role:'fk',ref:'doctors'},{name:'department_id',role:'fk',ref:'departments'},{name:'start_date',critical:true,aliases:['from_date','assigned_at','start']},{name:'end_date',required:false,aliases:['to_date','until','end']}]},
    ], relationships:[
      {label:'one doctor → many assignments', fk:{table:'assignments',ref:'doctors'}},
      {label:'one department → many assignments', fk:{table:'assignments',ref:'departments'}},
    ]},
    hints:['If you put department_id directly on doctors, you can only store the CURRENT department — history is lost.','Make each assignment its own row with start_date and end_date. The current one is the row whose end_date is empty.','assignments carries doctor_id, department_id, and the dates.'],
  },

  /* ---------- ADVANCED ---------- */
  {
    id:'linkedin', difficulty:'advanced', skill:'lifecycle + 1:1 analytics',
    title:'LinkedIn Post Automation (SaaS)',
    blurb:'Users, accounts, templates, posts, analytics.',
    story:`A SaaS tool automates LinkedIn content. Users connect multiple LinkedIn accounts. Users create AI posts from reusable templates. Each post moves through a lifecycle: draft → scheduled → published. Published posts collect analytics (impressions, likes, comments).`,
    reqs:['A user has many LinkedIn accounts and many templates.','A template can generate many posts; a post is created from one template.','A post carries its lifecycle status; analytics attach to a post.'],
    starter:['users','linkedin_accounts','templates','posts','post_analytics'],
    rubric:{ entities:[
      { name:'users', aliases:['user','accounts'], attrs:[{name:'id',role:'pk'},{name:'name',required:false,aliases:['email','username']}]},
      { name:'linkedin_accounts', aliases:['linkedin_account','accounts','social_accounts','connected_accounts'], attrs:[{name:'id',role:'pk'},{name:'user_id',role:'fk',ref:'users'},{name:'handle',required:false,aliases:['account_name','profile_url']}]},
      { name:'templates', aliases:['template','content_templates'], attrs:[{name:'id',role:'pk'},{name:'user_id',role:'fk',ref:'users'},{name:'content_type',required:false,aliases:['type','category']}]},
      { name:'posts', aliases:['post','content'], attrs:[{name:'id',role:'pk'},{name:'user_id',role:'fk',ref:'users'},{name:'template_id',role:'fk',ref:'templates'},{name:'status',critical:true,aliases:['state','lifecycle','stage']},{name:'scheduled_at',required:false,aliases:['scheduled_for','publish_at','published_at']}]},
      { name:'post_analytics', aliases:['analytics','post_analytic','metrics','performance','stats'], attrs:[{name:'id',role:'pk',required:false},{name:'post_id',role:'fk',ref:'posts'},{name:'impressions',required:false,aliases:['views']},{name:'likes',required:false},{name:'comments',required:false}]},
    ], relationships:[
      {label:'one user → many linkedin_accounts', fk:{table:'linkedin_accounts',ref:'users'}},
      {label:'one user → many templates', fk:{table:'templates',ref:'users'}},
      {label:'one template → many posts', fk:{table:'posts',ref:'templates'}},
      {label:'analytics attach to a post', fk:{table:'post_analytics',ref:'posts'}},
    ]},
    hints:['The post\'s lifecycle (draft/scheduled/published) is a status column ON posts — not five separate tables.','A template is reused to produce many posts → template_id is a FK on posts (one-to-many).','Analytics belong to a post → put post_id on the analytics table, not analytics columns on posts.'],
  },
  {
    id:'fooddelivery', difficulty:'advanced', skill:'marketplace + assignment',
    title:'Food Delivery Marketplace',
    blurb:'Restaurants, menus, orders, items, drivers, ratings.',
    story:`A delivery platform connects restaurants, customers, and drivers. Restaurants have menu items. Customers place orders containing several items. Each order is assigned to one driver. Customers rate restaurants and drivers.`,
    reqs:['Restaurants own menu items (one-to-many).','An order has many items (join with quantity); each order is assigned a driver.','Capture ratings for a restaurant/driver.'],
    starter:['restaurants','menu_items','customers','orders','order_items','drivers','ratings'],
    rubric:{ entities:[
      { name:'restaurants', aliases:['restaurant','vendors','stores'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'menu_items', aliases:['menu_item','dishes','dish','items','products','menu'], attrs:[{name:'id',role:'pk'},{name:'name'},{name:'price',required:false},{name:'restaurant_id',role:'fk',ref:'restaurants'}]},
      { name:'customers', aliases:['customer','users'], attrs:[{name:'id',role:'pk'},{name:'name'}]},
      { name:'drivers', aliases:['driver','riders','rider','delivery_partners'], attrs:[{name:'id',role:'pk'},{name:'name'},{name:'vehicle',required:false}]},
      { name:'orders', aliases:['order'], attrs:[{name:'id',role:'pk'},{name:'customer_id',role:'fk',ref:'customers'},{name:'driver_id',role:'fk',ref:'drivers'},{name:'restaurant_id',role:'fk',ref:'restaurants',required:false},{name:'status',required:false}]},
      { name:'order_items', aliases:['order_item','order_lines','line_items','cart_items'], attrs:[{name:'id',role:'pk',required:false},{name:'order_id',role:'fk',ref:'orders'},{name:'menu_item_id',role:'fk',ref:'menu_items',aliases:['item_id','dish_id']},{name:'quantity',critical:true,aliases:['qty']}]},
      { name:'ratings', aliases:['rating','reviews','review','feedback'], attrs:[{name:'id',role:'pk',required:false},{name:'customer_id',role:'fk',ref:'customers'},{name:'rating',aliases:['stars','score']},{name:'restaurant_id',role:'fk',ref:'restaurants',required:false},{name:'driver_id',role:'fk',ref:'drivers',required:false}]},
    ], relationships:[
      {label:'one restaurant → many menu_items', fk:{table:'menu_items',ref:'restaurants'}},
      {label:'one customer → many orders', fk:{table:'orders',ref:'customers'}},
      {label:'one driver → many orders (assignment)', fk:{table:'orders',ref:'drivers'}},
      {label:'one order → many order_items', fk:{table:'order_items',ref:'orders'}},
      {label:'one menu_item → many order_items', fk:{table:'order_items',ref:'menu_items'}},
    ]},
    hints:['Menu items belong to one restaurant → restaurant_id on menu_items.','Order ↔ menu_item is many-to-many → an order_items join table with quantity on it.','Driver assignment is one-to-many: a driver handles many orders → put driver_id on orders.'],
  },
];
