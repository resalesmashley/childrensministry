// Session storage for logged-in users (in-memory for demo)
let currentUser = {
    type: null, // 'parent', 'teacher', or 'admin'
    loggedIn: false,
    data: null
};

const CLASSROOMS = [
    {
        id: 'prek-a',
        name: 'Pre-K Room A',
        displayName: 'Pre-K Room A (Ages 3-5)',
        teacher: 'Sarah Martinez',
        accessCode: 'PREK-A'
    },
    {
        id: 'prek-b',
        name: 'Pre-K Room B',
        displayName: 'Pre-K Room B (Ages 3-5)',
        teacher: 'Caleb Turner',
        accessCode: 'PREK-B'
    },
    {
        id: 'elem-1',
        name: 'Elementary Grades 1-2',
        displayName: 'Elementary Grades 1-2',
        teacher: 'Mike Thompson',
        accessCode: 'ELEM-12'
    },
    {
        id: 'elem-3',
        name: 'Elementary Grades 3-5',
        displayName: 'Elementary Grades 3-5',
        teacher: 'Emily Chen',
        accessCode: 'ELEM-35'
    }
];

const DEFAULT_PARENT_ACCOUNTS = [
    {
        id: 'parent-001',
        name: 'Jennifer Smith',
        email: 'parent@demo.com',
        password: 'Parent2025!',
        childName: 'Emma Smith',
        classId: 'prek-a',
        accessCode: 'PREK-A',
        child: {
            name: 'Emma Smith',
            class: 'Pre-K Room A (Ages 3-5)',
            teacher: 'Sarah Martinez'
        },
        createdAt: '2025-10-01T12:00:00Z'
    }
];

let parentAccounts = [];

function getClassById(classId) {
    return CLASSROOMS.find(room => room.id === classId);
}

function persistParentAccounts() {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('bccParentAccounts', JSON.stringify(parentAccounts));
        }
    } catch (error) {
        console.warn('Unable to persist parent accounts.', error);
    }
}

function initializeParentAccounts() {
    let storedAccounts = [];

    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem('bccParentAccounts');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    storedAccounts = parsed;
                }
            }
        }
    } catch (error) {
        console.warn('Unable to read parent accounts from storage.', error);
    }

    if (!storedAccounts.length) {
        parentAccounts = [...DEFAULT_PARENT_ACCOUNTS];
        persistParentAccounts();
        return;
    }

    const defaultEmail = DEFAULT_PARENT_ACCOUNTS[0].email.toLowerCase();
    const hasDefault = storedAccounts.some(account => account.email?.toLowerCase() === defaultEmail);

    parentAccounts = hasDefault ? storedAccounts : [DEFAULT_PARENT_ACCOUNTS[0], ...storedAccounts];
    persistParentAccounts();
}

function findParentAccountByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return parentAccounts.find(account => account.email.trim().toLowerCase() === normalized) || null;
}

function generateParentAccountId() {
    return `parent-${Date.now()}`;
}

function createParentAccount({ name, email, password, childName, classId }) {
    if (!name || !email || !password || !childName || !classId) {
        throw new Error('All fields are required to create a parent account.');
    }

    if (findParentAccountByEmail(email)) {
        throw new Error('A parent with that email already exists.');
    }

    const classroom = getClassById(classId);
    if (!classroom) {
        throw new Error('Selected classroom is not available.');
    }

    const newAccount = {
        id: generateParentAccountId(),
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        childName: childName.trim(),
        classId: classroom.id,
        accessCode: classroom.accessCode,
        child: {
            name: childName.trim(),
            class: classroom.displayName,
            teacher: classroom.teacher
        },
        createdAt: new Date().toISOString()
    };

    parentAccounts.push(newAccount);
    persistParentAccounts();

    return newAccount;
}

initializeParentAccounts();

function getAllParentAccounts() {
    return [...parentAccounts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getParentAccountsByClass(classId) {
    if (!classId || classId === 'all') return getAllParentAccounts();
    return getAllParentAccounts().filter(account => account.classId === classId);
}

function exportParentAccountsToCSV() {
    const header = ['Parent Name', 'Email', 'Child Name', 'Class', 'Access Code', 'Created'];
    const rows = parentAccounts.map(account => [
        account.name,
        account.email,
        account.childName,
        getClassById(account.classId)?.displayName || account.classId,
        account.accessCode,
        new Date(account.createdAt).toLocaleString()
    ]);

    const csvContent = [header, ...rows]
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bcc-parent-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// --- DATA STORAGE (In-memory array to simulate database storage) ---
let LESSON_PLANS = [
    { id: 1, title: "Noah's Ark - God Keeps His Promises", group: "Pre-K (Ages 3-5)", date: "2025-11-03", scripture: "Genesis 6-9", keyverse: '"God keeps his promises." - Gen 9:16', activities: '9:00 - Welcome/Free Play\n9:15 - Worship Song\n9:30 - Bible Story\n9:50 - Craft/Game', materials: 'Rainbow craft supplies, animal figures, boat model' },
    { id: 2, title: "Jesus Loves the Little Children", group: "Pre-K (Ages 3-5)", date: "2025-10-27", scripture: "Mark 10:13-16", keyverse: '"Let the children come to me." - Mark 10:14', activities: '...', materials: '...' },
    { id: 3, title: "Creation - God Made Everything", group: "Pre-K (Ages 3-5)", date: "2025-10-20", scripture: "Genesis 1-2", keyverse: '"In the beginning, God created..." - Gen 1:1', activities: '...', materials: '...' }
];

// Resource Library Data
const RESOURCE_LIBRARY = [
    // Lesson Plans - Old Testament
    { id: 1, title: "Creation Story", category: "lesson-plans", subcategory: "old-testament", description: "7 days of creation lesson with activities", ageGroup: "Pre-K", icon: "📖" },
    { id: 2, title: "Noah's Ark", category: "lesson-plans", subcategory: "old-testament", description: "Complete lesson on God's faithfulness", ageGroup: "Pre-K", icon: "📖" },
    { id: 3, title: "Abraham's Journey", category: "lesson-plans", subcategory: "old-testament", description: "Faith and obedience lesson", ageGroup: "Elementary", icon: "📖" },
    { id: 4, title: "Moses and the Red Sea", category: "lesson-plans", subcategory: "old-testament", description: "God's deliverance and power", ageGroup: "Elementary", icon: "📖" },
    { id: 5, title: "David and Goliath", category: "lesson-plans", subcategory: "old-testament", description: "Courage and trusting God", ageGroup: "All Ages", icon: "📖" },
    { id: 6, title: "Joseph's Colorful Coat", category: "lesson-plans", subcategory: "old-testament", description: "Forgiveness and God's plan", ageGroup: "Pre-K", icon: "📖" },
    { id: 7, title: "Daniel in the Lion's Den", category: "lesson-plans", subcategory: "old-testament", description: "Standing firm in faith", ageGroup: "Elementary", icon: "📖" },
    { id: 8, title: "Jonah and the Big Fish", category: "lesson-plans", subcategory: "old-testament", description: "Obedience to God's call", ageGroup: "Pre-K", icon: "📖" },
    { id: 9, title: "The Tower of Babel", category: "lesson-plans", subcategory: "old-testament", description: "Pride and God's sovereignty", ageGroup: "Elementary", icon: "📖" },
    { id: 10, title: "Ruth and Naomi", category: "lesson-plans", subcategory: "old-testament", description: "Loyalty and faithfulness", ageGroup: "Elementary", icon: "📖" },
    { id: 11, title: "Samuel Hears God", category: "lesson-plans", subcategory: "old-testament", description: "Listening to God's voice", ageGroup: "Pre-K", icon: "📖" },
    { id: 12, title: "Esther Saves Her People", category: "lesson-plans", subcategory: "old-testament", description: "Courage and God's timing", ageGroup: "Elementary", icon: "📖" },
    { id: 13, title: "Joshua and Jericho", category: "lesson-plans", subcategory: "old-testament", description: "Following God's instructions", ageGroup: "Elementary", icon: "📖" },
    { id: 14, title: "Elijah and the Prophets of Baal", category: "lesson-plans", subcategory: "old-testament", description: "God's power over false gods", ageGroup: "Elementary", icon: "📖" },
    { id: 15, title: "The Ten Commandments", category: "lesson-plans", subcategory: "old-testament", description: "God's rules for living", ageGroup: "All Ages", icon: "📖" },
    
    // Lesson Plans - New Testament
    { id: 16, title: "The Birth of Jesus", category: "lesson-plans", subcategory: "new-testament", description: "Christmas story with nativity", ageGroup: "All Ages", icon: "📖" },
    { id: 17, title: "Jesus' Baptism", category: "lesson-plans", subcategory: "new-testament", description: "Beginning of Jesus' ministry", ageGroup: "Elementary", icon: "📖" },
    { id: 18, title: "The Good Samaritan", category: "lesson-plans", subcategory: "new-testament", description: "Loving your neighbor", ageGroup: "All Ages", icon: "📖" },
    { id: 19, title: "Jesus Feeds 5000", category: "lesson-plans", subcategory: "new-testament", description: "Miracles and sharing", ageGroup: "Pre-K", icon: "📖" },
    { id: 20, title: "Jesus Walks on Water", category: "lesson-plans", subcategory: "new-testament", description: "Faith over fear", ageGroup: "Elementary", icon: "📖" },
    { id: 21, title: "The Lost Sheep", category: "lesson-plans", subcategory: "new-testament", description: "God's love for everyone", ageGroup: "Pre-K", icon: "📖" },
    { id: 22, title: "Zacchaeus in the Tree", category: "lesson-plans", subcategory: "new-testament", description: "Jesus loves everyone", ageGroup: "Pre-K", icon: "📖" },
    { id: 23, title: "The Prodigal Son", category: "lesson-plans", subcategory: "new-testament", description: "Forgiveness and grace", ageGroup: "Elementary", icon: "📖" },
    { id: 24, title: "Jesus Heals the Blind Man", category: "lesson-plans", subcategory: "new-testament", description: "Miracles and compassion", ageGroup: "All Ages", icon: "📖" },
    { id: 25, title: "The Last Supper", category: "lesson-plans", subcategory: "new-testament", description: "Communion and remembrance", ageGroup: "Elementary", icon: "📖" },
    { id: 26, title: "Jesus' Crucifixion", category: "lesson-plans", subcategory: "new-testament", description: "Easter - God's sacrifice", ageGroup: "Elementary", icon: "📖" },
    { id: 27, title: "The Resurrection", category: "lesson-plans", subcategory: "new-testament", description: "Easter - Jesus is alive!", ageGroup: "All Ages", icon: "📖" },
    { id: 28, title: "The Great Commission", category: "lesson-plans", subcategory: "new-testament", description: "Sharing the good news", ageGroup: "Elementary", icon: "📖" },
    { id: 29, title: "Pentecost", category: "lesson-plans", subcategory: "new-testament", description: "The Holy Spirit comes", ageGroup: "Elementary", icon: "📖" },
    { id: 30, title: "Jesus Loves the Children", category: "lesson-plans", subcategory: "new-testament", description: "Jesus welcomes children", ageGroup: "Pre-K", icon: "📖" },
    { id: 31, title: "The Beatitudes", category: "lesson-plans", subcategory: "new-testament", description: "Blessed are...", ageGroup: "Elementary", icon: "📖" },
    { id: 32, title: "The Lord's Prayer", category: "lesson-plans", subcategory: "new-testament", description: "How to pray", ageGroup: "All Ages", icon: "📖" },
    { id: 33, title: "Parable of the Sower", category: "lesson-plans", subcategory: "new-testament", description: "Growing in faith", ageGroup: "Elementary", icon: "📖" },
    
    // Lesson Plans - Character Building
    { id: 34, title: "Sharing is Caring", category: "lesson-plans", subcategory: "character-building", description: "Learning to share with others", ageGroup: "Pre-K", icon: "📖" },
    { id: 35, title: "Being Thankful", category: "lesson-plans", subcategory: "character-building", description: "Gratitude and appreciation", ageGroup: "All Ages", icon: "📖" },
    { id: 36, title: "Telling the Truth", category: "lesson-plans", subcategory: "character-building", description: "Honesty and integrity", ageGroup: "Elementary", icon: "📖" },
    { id: 37, title: "Being a Good Friend", category: "lesson-plans", subcategory: "character-building", description: "Friendship and kindness", ageGroup: "Pre-K", icon: "📖" },
    { id: 38, title: "Patience and Waiting", category: "lesson-plans", subcategory: "character-building", description: "Learning self-control", ageGroup: "All Ages", icon: "📖" },
    { id: 39, title: "Showing Respect", category: "lesson-plans", subcategory: "character-building", description: "Respecting others", ageGroup: "Elementary", icon: "📖" },
    { id: 40, title: "Courage and Bravery", category: "lesson-plans", subcategory: "character-building", description: "Being brave in God", ageGroup: "Elementary", icon: "📖" },
    { id: 41, title: "Kindness to Others", category: "lesson-plans", subcategory: "character-building", description: "Acts of kindness", ageGroup: "All Ages", icon: "📖" },
    { id: 42, title: "Forgiveness", category: "lesson-plans", subcategory: "character-building", description: "Forgiving others as God forgives", ageGroup: "Elementary", icon: "📖" },
    { id: 43, title: "Joy in the Lord", category: "lesson-plans", subcategory: "character-building", description: "Finding happiness in God", ageGroup: "Pre-K", icon: "📖" },
    
    // Lesson Plans - Seasonal
    { id: 44, title: "Thanksgiving Blessings", category: "lesson-plans", subcategory: "seasonal", description: "Counting our blessings", ageGroup: "All Ages", icon: "📖" },
    { id: 45, title: "Christmas Joy", category: "lesson-plans", subcategory: "seasonal", description: "Celebrating Jesus' birth", ageGroup: "All Ages", icon: "📖" },
    { id: 46, title: "Easter Celebration", category: "lesson-plans", subcategory: "seasonal", description: "Resurrection Sunday", ageGroup: "All Ages", icon: "📖" },
    { id: 47, title: "Fall Harvest", category: "lesson-plans", subcategory: "seasonal", description: "God provides for us", ageGroup: "Pre-K", icon: "📖" },
    { id: 48, title: "New Year, New Beginnings", category: "lesson-plans", subcategory: "seasonal", description: "Fresh starts with God", ageGroup: "Elementary", icon: "📖" },
    { id: 49, title: "Valentine's Day - God's Love", category: "lesson-plans", subcategory: "seasonal", description: "God's unconditional love", ageGroup: "All Ages", icon: "📖" },
    { id: 50, title: "Spring Renewal", category: "lesson-plans", subcategory: "seasonal", description: "New life in Christ", ageGroup: "Pre-K", icon: "📖" },
    
    // Craft Templates
    { id: 51, title: "Noah's Ark Craft", category: "craft-templates", description: "Paper boat and animals", ageGroup: "Pre-K", icon: "✂️" },
    { id: 52, title: "Cross Decoration", category: "craft-templates", description: "Easter cross craft", ageGroup: "All Ages", icon: "✂️" },
    { id: 53, title: "Nativity Scene", category: "craft-templates", description: "Christmas manger craft", ageGroup: "Pre-K", icon: "✂️" },
    { id: 54, title: "Butterfly Transformation", category: "craft-templates", description: "New life in Christ", ageGroup: "Elementary", icon: "✂️" },
    { id: 55, title: "Prayer Hands", category: "craft-templates", description: "Handprint prayer reminder", ageGroup: "Pre-K", icon: "✂️" },
    { id: 56, title: "Bible Bookmark", category: "craft-templates", description: "Decorative scripture markers", ageGroup: "Elementary", icon: "✂️" },
    { id: 57, title: "Rainbow Promise", category: "craft-templates", description: "God's covenant reminder", ageGroup: "Pre-K", icon: "✂️" },
    { id: 58, title: "Fruit of the Spirit", category: "craft-templates", description: "Fruit basket craft", ageGroup: "All Ages", icon: "✂️" },
    { id: 59, title: "Armor of God Shield", category: "craft-templates", description: "Ephesians 6 craft", ageGroup: "Elementary", icon: "✂️" },
    { id: 60, title: "Creation Wheel", category: "craft-templates", description: "7 days spinner craft", ageGroup: "Pre-K", icon: "✂️" },
    { id: 61, title: "Thankful Turkey", category: "craft-templates", description: "Thanksgiving craft", ageGroup: "All Ages", icon: "✂️" },
    { id: 62, title: "Gingerbread Nativity", category: "craft-templates", description: "Christmas craft", ageGroup: "Elementary", icon: "✂️" },
    { id: 63, title: "Heart of Love", category: "craft-templates", description: "Valentine's Day craft", ageGroup: "Pre-K", icon: "✂️" },
    { id: 64, title: "Angel Wings", category: "craft-templates", description: "Christmas angel craft", ageGroup: "All Ages", icon: "✂️" },
    { id: 65, title: "Good Samaritan First Aid Kit", category: "craft-templates", description: "Kindness craft", ageGroup: "Elementary", icon: "✂️" },
    { id: 66, title: "Jonah's Whale", category: "craft-templates", description: "Paper plate whale", ageGroup: "Pre-K", icon: "✂️" },
    { id: 67, title: "David's Sling", category: "craft-templates", description: "Courage craft", ageGroup: "Elementary", icon: "✂️" },
    { id: 68, title: "Joseph's Coat", category: "craft-templates", description: "Colorful coat craft", ageGroup: "All Ages", icon: "✂️" },
    { id: 69, title: "Palm Sunday Palms", category: "craft-templates", description: "Palm branch craft", ageGroup: "Pre-K", icon: "✂️" },
    { id: 70, title: "Stained Glass Cross", category: "craft-templates", description: "Tissue paper craft", ageGroup: "Elementary", icon: "✂️" },
    { id: 71, title: "Moses' Basket", category: "craft-templates", description: "Baby Moses craft", ageGroup: "Pre-K", icon: "✂️" },
    { id: 72, title: "Ten Commandments Tablets", category: "craft-templates", description: "Stone tablet craft", ageGroup: "Elementary", icon: "✂️" },
    { id: 73, title: "Zacchaeus Tree", category: "craft-templates", description: "Sycamore tree craft", ageGroup: "All Ages", icon: "✂️" },
    { id: 74, title: "Loaves and Fishes", category: "craft-templates", description: "Miracle craft", ageGroup: "Pre-K", icon: "✂️" },
    { id: 75, title: "Shepherd's Staff", category: "craft-templates", description: "Good shepherd craft", ageGroup: "Elementary", icon: "✂️" },
    
    // Coloring Pages
    { id: 76, title: "Jesus with Children", category: "coloring-pages", description: "Let the children come", ageGroup: "Pre-K", icon: "🖍️" },
    { id: 77, title: "Creation Days", category: "coloring-pages", description: "7 days coloring set", ageGroup: "All Ages", icon: "🖍️" },
    { id: 78, title: "Noah's Animals", category: "coloring-pages", description: "Animal pairs coloring", ageGroup: "Pre-K", icon: "🖍️" },
    { id: 79, title: "David and Goliath", category: "coloring-pages", description: "Battle scene coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 80, title: "Nativity Scene", category: "coloring-pages", description: "Christmas coloring", ageGroup: "All Ages", icon: "🖍️" },
    { id: 81, title: "Resurrection Morning", category: "coloring-pages", description: "Empty tomb coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 82, title: "Good Samaritan", category: "coloring-pages", description: "Kindness coloring", ageGroup: "All Ages", icon: "🖍️" },
    { id: 83, title: "Jonah and Whale", category: "coloring-pages", description: "Big fish coloring", ageGroup: "Pre-K", icon: "🖍️" },
    { id: 84, title: "Daniel with Lions", category: "coloring-pages", description: "Lion's den coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 85, title: "Fruit of the Spirit", category: "coloring-pages", description: "Fruit basket coloring", ageGroup: "All Ages", icon: "🖍️" },
    { id: 86, title: "Armor of God", category: "coloring-pages", description: "Warrior coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 87, title: "Ten Commandments", category: "coloring-pages", description: "Tablets coloring", ageGroup: "All Ages", icon: "🖍️" },
    { id: 88, title: "Zacchaeus in Tree", category: "coloring-pages", description: "Tree scene coloring", ageGroup: "Pre-K", icon: "🖍️" },
    { id: 89, title: "Moses and Red Sea", category: "coloring-pages", description: "Parting waters coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 90, title: "Baby Jesus in Manger", category: "coloring-pages", description: "Simple nativity coloring", ageGroup: "Pre-K", icon: "🖍️" },
    { id: 91, title: "Last Supper", category: "coloring-pages", description: "Communion coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 92, title: "Angels Announce Birth", category: "coloring-pages", description: "Shepherds coloring", ageGroup: "All Ages", icon: "🖍️" },
    { id: 93, title: "Prodigal Son Returns", category: "coloring-pages", description: "Forgiveness coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 94, title: "Rainbow Promise", category: "coloring-pages", description: "Covenant coloring", ageGroup: "Pre-K", icon: "🖍️" },
    { id: 95, title: "Jesus Walks on Water", category: "coloring-pages", description: "Miracle coloring", ageGroup: "Elementary", icon: "🖍️" },
    { id: 96, title: "Palm Sunday", category: "coloring-pages", description: "Triumphal entry coloring", ageGroup: "All Ages", icon: "🖍️" },
    { id: 97, title: "Five Loaves Two Fish", category: "coloring-pages", description: "Feeding 5000 coloring", ageGroup: "Pre-K", icon: "🖍️" },
    
    // Activity Sheets
    { id: 98, title: "Bible Word Search", category: "activity-sheets", description: "Character names puzzle", ageGroup: "Elementary", icon: "📝" },
    { id: 99, title: "Creation Maze", category: "activity-sheets", description: "7 days maze activity", ageGroup: "Pre-K", icon: "📝" },
    { id: 100, title: "Fruit of Spirit Matching", category: "activity-sheets", description: "Match fruit to trait", ageGroup: "Elementary", icon: "📝" },
    { id: 101, title: "Bible Story Sequencing", category: "activity-sheets", description: "Put events in order", ageGroup: "All Ages", icon: "📝" },
    { id: 102, title: "Scripture Memory Cards", category: "activity-sheets", description: "Verse memorization", ageGroup: "Elementary", icon: "📝" },
    { id: 103, title: "Connect the Dots - Cross", category: "activity-sheets", description: "Easter activity", ageGroup: "Pre-K", icon: "📝" },
    { id: 104, title: "Bible Character Crossword", category: "activity-sheets", description: "Names and facts puzzle", ageGroup: "Elementary", icon: "📝" },
    { id: 105, title: "Color by Number - Ark", category: "activity-sheets", description: "Noah's ark activity", ageGroup: "Pre-K", icon: "📝" },
    { id: 106, title: "Ten Commandments Fill-in", category: "activity-sheets", description: "Complete the rules", ageGroup: "Elementary", icon: "📝" },
    { id: 107, title: "Thanksgiving Gratitude List", category: "activity-sheets", description: "What I'm thankful for", ageGroup: "All Ages", icon: "📝" },
    { id: 108, title: "Bible Bingo", category: "activity-sheets", description: "Story element bingo", ageGroup: "Elementary", icon: "📝" },
    { id: 109, title: "Armor of God Labeling", category: "activity-sheets", description: "Identify armor parts", ageGroup: "Elementary", icon: "📝" },
    { id: 110, title: "Parable Matching Game", category: "activity-sheets", description: "Match story to lesson", ageGroup: "Elementary", icon: "📝" },
    { id: 111, title: "Christmas Story Order", category: "activity-sheets", description: "Nativity sequence", ageGroup: "All Ages", icon: "📝" },
    { id: 112, title: "Acts of Kindness Checklist", category: "activity-sheets", description: "Good deeds tracker", ageGroup: "Pre-K", icon: "📝" },
    { id: 113, title: "Bible Books Memory Game", category: "activity-sheets", description: "Old/New Testament", ageGroup: "Elementary", icon: "📝" },
    { id: 114, title: "David and Goliath Spot Difference", category: "activity-sheets", description: "Find the differences", ageGroup: "All Ages", icon: "📝" },
    { id: 115, title: "Creation Counting", category: "activity-sheets", description: "Count God's creations", ageGroup: "Pre-K", icon: "📝" },
    { id: 116, title: "Beatitudes Unscramble", category: "activity-sheets", description: "Word scramble puzzle", ageGroup: "Elementary", icon: "📝" },
    { id: 117, title: "Prayer Journal Pages", category: "activity-sheets", description: "Daily prayer prompts", ageGroup: "All Ages", icon: "📝" },
    { id: 118, title: "Miracles of Jesus Quiz", category: "activity-sheets", description: "True/false questions", ageGroup: "Elementary", icon: "📝" },
    { id: 119, title: "Animal Ark Counting", category: "activity-sheets", description: "Count pairs activity", ageGroup: "Pre-K", icon: "📝" },
    { id: 120, title: "Easter Story Timeline", category: "activity-sheets", description: "Holy week sequence", ageGroup: "Elementary", icon: "📝" },
    { id: 121, title: "Character Traits Assessment", category: "activity-sheets", description: "Self-reflection worksheet", ageGroup: "Elementary", icon: "📝" },
    { id: 122, title: "Shepherd's Maze", category: "activity-sheets", description: "Find the lost sheep", ageGroup: "Pre-K", icon: "📝" },
    { id: 123, title: "Bible Trivia Cards", category: "activity-sheets", description: "Question and answer game", ageGroup: "All Ages", icon: "📝" },
    
    // Music & Songs
    { id: 124, title: "Jesus Loves Me", category: "music-songs", description: "Classic children's hymn", ageGroup: "Pre-K", icon: "🎵" },
    { id: 125, title: "This Little Light of Mine", category: "music-songs", description: "Shine for Jesus song", ageGroup: "All Ages", icon: "🎵" },
    { id: 126, title: "Father Abraham", category: "music-songs", description: "Action song", ageGroup: "Pre-K", icon: "🎵" },
    { id: 127, title: "The B-I-B-L-E", category: "music-songs", description: "Bible song with motions", ageGroup: "All Ages", icon: "🎵" },
    { id: 128, title: "Deep and Wide", category: "music-songs", description: "God's love song", ageGroup: "Pre-K", icon: "🎵" },
    { id: 129, title: "He's Got the Whole World", category: "music-songs", description: "God's sovereignty song", ageGroup: "All Ages", icon: "🎵" },
    { id: 130, title: "Zacchaeus Was a Wee Little Man", category: "music-songs", description: "Bible story song", ageGroup: "Pre-K", icon: "🎵" },
    { id: 131, title: "I'm in the Lord's Army", category: "music-songs", description: "Action march song", ageGroup: "Elementary", icon: "🎵" },
    { id: 132, title: "The Wise Man Built His House", category: "music-songs", description: "Foundation song", ageGroup: "All Ages", icon: "🎵" },
    { id: 133, title: "Arky Arky", category: "music-songs", description: "Noah's ark song", ageGroup: "Pre-K", icon: "🎵" },
    { id: 134, title: "Praise Him All Ye Little Children", category: "music-songs", description: "Worship song", ageGroup: "All Ages", icon: "🎵" },
    { id: 135, title: "Jesus Loves the Little Children", category: "music-songs", description: "All nations song", ageGroup: "Pre-K", icon: "🎵" },
    { id: 136, title: "Hallelu, Hallelujah", category: "music-songs", description: "Praise song", ageGroup: "All Ages", icon: "🎵" },
    { id: 137, title: "Only a Boy Named David", category: "music-songs", description: "David and Goliath song", ageGroup: "Elementary", icon: "🎵" },
    { id: 138, title: "Do Lord", category: "music-songs", description: "Home in glory land song", ageGroup: "All Ages", icon: "🎵" },
    { id: 139, title: "Climb Climb Up Sunshine Mountain", category: "music-songs", description: "Joy song", ageGroup: "Pre-K", icon: "🎵" },
    { id: 140, title: "Rejoice in the Lord Always", category: "music-songs", description: "Philippians 4:4 song", ageGroup: "Elementary", icon: "🎵" },
    { id: 141, title: "The Fruit of the Spirit", category: "music-songs", description: "Galatians 5:22 song", ageGroup: "All Ages", icon: "🎵" },
    { id: 142, title: "Books of the Bible Song", category: "music-songs", description: "Learning Bible books", ageGroup: "Elementary", icon: "🎵" },
    { id: 143, title: "God Is So Good", category: "music-songs", description: "Simple praise song", ageGroup: "Pre-K", icon: "🎵" },
    
    // Parent Resources
    { id: 144, title: "Weekly Devotional Guide", category: "parent-resources", description: "Family devotion plans", ageGroup: "Parents", icon: "👨‍👩‍👧" },
    { id: 145, title: "Conversation Starters", category: "parent-resources", description: "Faith discussion prompts", ageGroup: "Parents", icon: "👨‍👩‍👧" },
    { id: 146, title: "Bedtime Prayer Ideas", category: "parent-resources", description: "Nightly prayer guides", ageGroup: "Parents", icon: "👨‍👩‍👧" },
    { id: 147, title: "Teaching Kids to Pray", category: "parent-resources", description: "Prayer instruction guide", ageGroup: "Parents", icon: "👨‍👩‍👧" },
    { id: 148, title: "Age-Appropriate Bible Reading", category: "parent-resources", description: "Scripture selection guide", ageGroup: "Parents", icon: "👨‍👩‍👧" },
    { id: 149, title: "Answering Tough Questions", category: "parent-resources", description: "Theological discussion help", ageGroup: "Parents", icon: "👨‍👩‍👧" },
    { id: 150, title: "Family Worship Ideas", category: "parent-resources", description: "Home worship planning", ageGroup: "Parents", icon: "👨‍👩‍👧" }
];

// Demo user credentials
const DEMO_USERS = {
    parent: {
        email: 'parent@demo.com',
        password: 'Parent2025!',
        classCode: 'PREK-A',
        name: 'Jennifer Smith',
        child: {
            name: 'Emma Smith',
            class: 'Pre-K Room A (Ages 3-5)',
            teacher: 'Sarah Martinez'
        }
    },
    teacher: {
        email: 'teacher@demo.com',
        password: 'Teacher2025!',
        name: 'Sarah Martinez',
        class: 'Pre-K Room A (Ages 3-5)',
        enrollment: 12
    },
    admin: {
        email: 'admin@demo.com',
        password: 'Admin2025!',
        otp: '146829',
        name: 'Pastor David Johnson'
    }
};

// Current filter state
let currentCategory = 'all';
let currentSubcategories = [];

// Page Navigation
function showPage(pageName) {
    const pageIds = ['home', 'about', 'staff', 'prek', 'elementary', 'events', 'volunteer',
                     'resources', 'shop', 'cart', 'order-status', 'customer-support', 'gallery',
                     'portals', 'parent-portal', 'teacher-portal', 'contact', 'parent-dashboard',
                     'teacher-dashboard', 'lesson-plan-builder', 'resource-library',
                     'teacher-messages', 'admin-dashboard'];
    const pageIds = ['home', 'about', 'staff', 'prek', 'elementary', 'events', 'volunteer',
                     'resources', 'shop', 'cart', 'order-status', 'customer-support', 'gallery',
                     'portals', 'parent-portal', 'teacher-portal', 'contact', 'parent-dashboard',
                     'teacher-dashboard', 'lesson-plan-builder', 'resource-library',
                     'teacher-messages', 'admin-dashboard'];
    
    pageIds.forEach(page => {
        const element = document.getElementById(page + '-page');
        if (element) {
            element.className = 'page-hidden';
        }
    });

    const adminParentPanel = document.getElementById('admin-parent-management');
    if (adminParentPanel) {
        adminParentPanel.className = pageName === 'admin-parent-management' ? 'page-visible' : 'page-hidden';
    }

    const selectedPage = document.getElementById(pageName + '-page');
    if (selectedPage) {
        selectedPage.className = 'page-visible';
    }

    // Update breadcrumb
    const breadcrumbMap = {
        'home': 'BCC Children\'s Ministry',
        'about': 'About Us',
        'staff': 'Our Team',
        'prek': 'Pre-K Ministry',
        'elementary': 'Elementary Ministry',
        'events': 'Events & Activities',
        'volunteer': 'Volunteer',
        'resources': 'Resources',
        'shop': 'Marketplace',
        'cart': 'Shopping Cart',
        'order-status': 'Order Status',
        'customer-support': 'Customer Support',
        'gallery': 'Photo Gallery',
        'portals': 'Portal Access',
        'volunteer': 'Volunteer',
        'resources': 'Resources',
        'shop': 'Marketplace',
        'cart': 'Shopping Cart',
        'order-status': 'Order Status',
        'customer-support': 'Customer Support',
        'gallery': 'Photo Gallery',
        'portals': 'Portal Access',
        'parent-portal': 'Parent Portal',
        'teacher-portal': 'Teacher Portal',
        'parent-dashboard': 'Parent Dashboard',
        'teacher-dashboard': 'Teacher Dashboard',
        'lesson-plan-builder': 'New Lesson Plan',
        'resource-library': 'Resource Library',
        'teacher-messages': 'Messages',
        'admin-dashboard': 'Admin Control Center',
        'admin-parent-management': 'Parent Accounts',
        'contact': 'Contact Us'
    };

    const breadcrumb = document.getElementById('breadcrumbCurrent');
    if (breadcrumb && breadcrumbMap[pageName]) {
        breadcrumb.textContent = breadcrumbMap[pageName];
    }

    // Update active nav
    const navLinks = document.querySelectorAll('.sub-nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    const navItemName = pageName.replace(/-portal|-dashboard|-builder|-library|-messages/, ''); 
    const activeNav = document.getElementById('nav-' + navItemName);
    if (activeNav) activeNav.classList.add('active');

    if (pageName === 'teacher-portal') {
        setStaffLoginRole('teacher');
    }

    // On loading teacher-dashboard, re-render the lesson list
    if (pageName === 'teacher-dashboard') {
        renderLessonPlans();
    }

    if (pageName === 'admin-dashboard') {
        hydrateAdminDashboard();
    }

    if (pageName === 'admin-parent-management') {
        showAdminParentPanel();
    }

    if (pageName === 'resource-library') {
        renderResourceLibrary();
    }

    if (pageName === 'teacher-messages') {
        setTimeout(() => {
            loadConversations();
        }, 100);
    }

    if (pageName === 'shop') {
        renderProductCatalog();
    }

    if (pageName === 'cart') {
        renderCart();
    }

    if (pageName === 'order-status') {
        const orderInput = document.getElementById('order-status-id');
        if (orderInput) {
            setTimeout(() => orderInput.focus(), 150);
        }
    }

    if (pageName === 'customer-support') {
        initializeCustomerChat();
        const chatInput = document.getElementById('customer-chat-input');
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 200);
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
    if (pageName === 'teacher-messages') {
        setTimeout(() => {
            loadConversations();
        }, 100);
    }

    if (pageName === 'shop') {
        renderProductCatalog();
    }

    if (pageName === 'cart') {
        renderCart();
    }

    if (pageName === 'order-status') {
        const orderInput = document.getElementById('order-status-id');
        if (orderInput) {
            setTimeout(() => orderInput.focus(), 150);
        }
    }

    if (pageName === 'customer-support') {
        initializeCustomerChat();
        const chatInput = document.getElementById('customer-chat-input');
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 200);
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setStaffLoginRole(role) {
    const teacherToggle = document.getElementById('teacher-role-toggle');
    const adminToggle = document.getElementById('admin-role-toggle');
    const teacherPanel = document.getElementById('teacher-login-panel');
    const adminPanel = document.getElementById('admin-login-panel');

    if (!teacherToggle || !adminToggle || !teacherPanel || !adminPanel) return;

    const isTeacher = role === 'teacher';

    teacherToggle.classList.toggle('active', isTeacher);
    teacherToggle.setAttribute('aria-selected', isTeacher);
    adminToggle.classList.toggle('active', !isTeacher);
    adminToggle.setAttribute('aria-selected', !isTeacher);

    if (isTeacher) {
        teacherPanel.removeAttribute('hidden');
        adminPanel.setAttribute('hidden', '');
        const teacherEmail = document.getElementById('teacher-email');
        if (teacherEmail) teacherEmail.focus();
    } else {
        adminPanel.removeAttribute('hidden');
        teacherPanel.setAttribute('hidden', '');
        const adminEmail = document.getElementById('admin-email');
        if (adminEmail) adminEmail.focus();
    }
}

// Mobile menu toggle
function toggleMenu() {
    const menu = document.getElementById('mainMenuList');
    menu.classList.toggle('active');
}

// --- LESSON PLAN LOGIC ---

// Function to render the list of lesson plans on the dashboard
function renderLessonPlans() {
    const listContainer = document.getElementById('teacher-lesson-list');
    if (!listContainer) return;

    // Sort by date descending
    const sortedPlans = LESSON_PLANS.sort((a, b) => new Date(b.date) - new Date(a.date));

    listContainer.innerHTML = sortedPlans.map(plan => {
        const dateFormatted = new Date(plan.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return `
            <div class="lesson-plan-item">
                <div>
                    <h4>${plan.title}</h4>
                    <p>${plan.group.split(' ')[0]} | ${dateFormatted} | ${plan.scripture || 'No reference'}</p>
                </div>
                <div class="lesson-actions">
                    <a href="#" onclick="viewLessonPlan(${plan.id}); return false;" class="btn-link">View</a>
                    <a href="#" onclick="editLessonPlan(${plan.id}); return false;" class="btn-link">Edit</a>
                    <a href="#" onclick="duplicateLessonPlan(${plan.id}); return false;" class="btn-link">Duplicate</a>
                </div>
            </div>
        `;
    }).join('');
}

// Function to handle saving a new lesson plan
function saveLessonPlan(event) {
    event.preventDefault();
    const form = event.target;
    
    // Create a new lesson object from form inputs
    const newLesson = {
        id: LESSON_PLANS.length + 1,
        title: form['lp-title'].value,
        group: form['lp-group'].value,
        date: form['lp-date'].value,
        scripture: form['lp-scripture'].value || 'N/A',
        keyverse: form['lp-keyverse'].value || 'N/A',
        objectives: form['lp-objectives'].value || 'N/A',
        activities: form['lp-activities'].value,
        materials: form['lp-materials'].value || 'N/A'
    };

    // Add to in-memory storage
    LESSON_PLANS.push(newLesson);

    // Provide user feedback
    alert(`Lesson Plan "${newLesson.title}" for ${newLesson.group} on ${newLesson.date} saved successfully!`);

    // Reset the form and navigate back to the dashboard
    form.reset();
    showPage('teacher-dashboard');
}

function viewLessonPlan(id) {
    const plan = LESSON_PLANS.find(p => p.id === id);
    if (!plan) {
        alert('Lesson plan not found.');
        return;
    }
    
    const dateFormatted = new Date(plan.date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const display = `
📖 Lesson Plan: ${plan.title}
-----------------------------------------
Group: ${plan.group}
Date: ${dateFormatted}
Scripture: ${plan.scripture}
Key Verse: ${plan.keyverse}

OBJECTIVES:
${plan.objectives}

ACTIVITIES / FLOW:
${plan.activities}

MATERIALS NEEDED:
${plan.materials}
    `;
    
    alert(display);
}

function editLessonPlan(id) {
    alert(`✏️ Edit Lesson Plan ID ${id}\n\nOpening lesson plan editor...\n\n(Demo mode - Editing interface would load existing data.)`);
}

function duplicateLessonPlan(id) {
    alert(`📋 Duplicate Lesson Plan ID ${id}\n\nLesson plan has been duplicated!\n\nYou can now edit the copy for a different date or age group.\n\n(Demo mode - Lesson plan duplication)`);
}

// --- RESOURCE LIBRARY LOGIC ---

function renderResourceLibrary() {
    const grid = document.getElementById('resource-grid');
    if (!grid) return;

    // Reset filters when first loading
    currentCategory = 'all';
    currentSubcategories = [];
    
    // Reset active category pill
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    document.querySelector('[data-category="all"]').classList.add('active');
    
    // Hide subcategory filter
    document.getElementById('lesson-subcategory-filter').style.display = 'none';
    
    // Clear search
    document.getElementById('resource-search').value = '';
    
    // Clear subcategory checkboxes
    document.querySelectorAll('.subcategory-checkboxes input').forEach(cb => {
        cb.checked = false;
    });
    
    filterResources();
}

function filterByCategory(category) {
    currentCategory = category;
    currentSubcategories = [];
    
    // Update active pill
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Show/hide subcategory filter
    const subcategoryFilter = document.getElementById('lesson-subcategory-filter');
    if (category === 'lesson-plans') {
        subcategoryFilter.style.display = 'block';
    } else {
        subcategoryFilter.style.display = 'none';
    }
    
    // Clear subcategory checkboxes
    document.querySelectorAll('.subcategory-checkboxes input').forEach(cb => {
        cb.checked = false;
    });
    
    filterResources();
}

function filterResources() {
    const searchTerm = document.getElementById('resource-search').value.toLowerCase();
    
    // Get checked subcategories
    currentSubcategories = Array.from(document.querySelectorAll('.subcategory-checkboxes input:checked'))
        .map(cb => cb.value);
    
    // Filter resources
    let filtered = RESOURCE_LIBRARY;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(r => r.category === currentCategory);
    }
    
    // Filter by subcategory (only if category is lesson-plans and subcategories are selected)
    if (currentCategory === 'lesson-plans' && currentSubcategories.length > 0) {
        filtered = filtered.filter(r => currentSubcategories.includes(r.subcategory));
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(searchTerm) ||
            r.description.toLowerCase().includes(searchTerm) ||
            r.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update count
    document.getElementById('resource-count').textContent = filtered.length;
    
    // Render resources
    const grid = document.getElementById('resource-grid');
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align : center; padding: 3rem; color: #666;">No resources found matching your criteria. Try adjusting your filters or search terms.</p>';
    } else {
        grid.innerHTML = filtered.map(resource => `
            <div class="resource-card" onclick="viewResource(${resource.id})">
                <div class="resource-card-icon">${resource.icon}</div>
                <h4>${resource.title}</h4>
                <p class="resource-description">${resource.description}</p>
                <div class="resource-meta">
                    <span class="resource-age-badge">${resource.ageGroup}</span>
                    <span class="resource-category-badge">${formatCategoryName(resource.category)}</span>
                </div>
                <button class="btn-secondary resource-download-btn" onclick="downloadResource(event, ${resource.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="white" style="vertical-align: middle; margin-right: 0.25rem;">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                    </svg>
                    Download
                </button>
            </div>
        `).join('');
    }
}

function clearFilters() {
    currentCategory = 'all';
    currentSubcategories = [];
    
    // Reset category pills
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    document.querySelector('[data-category="all"]').classList.add('active');
    
    // Hide subcategory filter
    document.getElementById('lesson-subcategory-filter').style.display = 'none';
    
    // Clear search
    document.getElementById('resource-search').value = '';
    
    // Clear subcategory checkboxes
    document.querySelectorAll('.subcategory-checkboxes input').forEach(cb => {
        cb.checked = false;
    });
    
    filterResources();
}

function formatCategoryName(category) {
    const names = {
        'lesson-plans': 'Lesson Plan',
        'craft-templates': 'Craft',
        'coloring-pages': 'Coloring',
        'activity-sheets': 'Activity',
        'music-songs': 'Music',
        'parent-resources': 'Parent Resource'
    };
    return names[category] || category;
}

function viewResource(id) {
    const resource = RESOURCE_LIBRARY.find(r => r.id === id);
    if (!resource) return;
    
    alert(`📖 ${resource.title}\n\nCategory: ${formatCategoryName(resource.category)}\nAge Group: ${resource.ageGroup}\n\nDescription:\n${resource.description}\n\n(Demo mode - Full resource viewer would display complete content with preview)`);
}

function downloadResource(event, id) {
    event.stopPropagation(); // Prevent card click
    const resource = RESOURCE_LIBRARY.find(r => r.id === id);
    if (!resource) return;
    
    alert(`⬇️ Downloading: ${resource.title}\n\nFile type: PDF\nSize: ~2.5 MB\n\n(Demo mode - In production, this would download the actual resource file)`);
}

// --- END RESOURCE LIBRARY LOGIC ---

// Parent Login Handler
function handleParentLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('parent-email').value;
    const password = document.getElementById('parent-password').value;

    const account = findParentAccountByEmail(email);

    if (account && password === account.password) {
        currentUser = {
            type: 'parent',
            loggedIn: true,
            data: account
        };

        document.getElementById('parent-name').textContent = account.name;

        showPage('parent-dashboard');
        resetParentPanel();

        setTimeout(() => {
            updateParentViewAfterLogin();
        }, 100);
    } else {
        alert('Invalid credentials. Please check your email and password.');
    const password = document.getElementById('parent-password').value;

    const account = findParentAccountByEmail(email);

    if (account && password === account.password) {
        currentUser = {
            type: 'parent',
            loggedIn: true,
            data: account
        };

        document.getElementById('parent-name').textContent = account.name;

        showPage('parent-dashboard');
        resetParentPanel();

        setTimeout(() => {
            updateParentViewAfterLogin();
        }, 100);
    } else {

        document.getElementById('parent-name').textContent = account.name;

        showPage('parent-dashboard');

        setTimeout(() => {
            updateParentViewAfterLogin();
        }, 100);
    } else {
        alert('Invalid credentials. Please check your email and password.');
    }
}

// Teacher Login Handler
function handleTeacherLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('teacher-email').value;
    const password = document.getElementById('teacher-password').value;
    
    if (email === DEMO_USERS.teacher.email && 
        password === DEMO_USERS.teacher.password) {
        
        currentUser = {
            type: 'teacher',
            loggedIn: true,
            data: DEMO_USERS.teacher
        };
        
        const teacherNameEl = document.getElementById('teacher-name');
        if (teacherNameEl) {
            teacherNameEl.textContent = DEMO_USERS.teacher.name;
        }
        
        showToast('Login successful! Teacher dashboard unlocked.');
        
        showPage('teacher-dashboard');
    } else {
        showToast('Invalid teacher credentials. Use demo login above.', true);
    }
}

function handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const otp = document.getElementById('admin-otp').value;

    if (email === DEMO_USERS.admin.email &&
        password === DEMO_USERS.admin.password &&
        otp === DEMO_USERS.admin.otp) {

        currentUser = {
            type: 'admin',
            loggedIn: true,
            data: DEMO_USERS.admin
        };

        const adminNameEl = document.getElementById('admin-name');
        if (adminNameEl) {
            adminNameEl.textContent = DEMO_USERS.admin.name;
        }

        showToast('Admin access granted. Control Center ready.');

        showPage('admin-dashboard');
        hydrateAdminDashboard();
    } else {
        showToast('Admin login failed. Verify email, password, and OTP.', true);
    }
}

// Logout Handler
function handleLogout(userType) {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = {
            type: null,
            loggedIn: false,
            data: null
        };
        
        if (userType === 'parent') {
            showPage('parent-portal');
            document.getElementById('parent-login-form').reset();
        } else if (userType === 'teacher') {
            showPage('teacher-portal');
            const teacherForm = document.getElementById('teacher-login-form');
            if (teacherForm) teacherForm.reset();
        } else if (userType === 'admin') {
            showPage('teacher-portal');
            setStaffLoginRole('admin');
            const adminForm = document.getElementById('admin-login-form');
            if (adminForm) adminForm.reset();
        }
        
        showToast('You have been logged out successfully.');
    }
}

// Parent Portal Feature Data & Helpers
const PARENT_GALLERY_ITEMS = [
    { id: 1, title: "Craft Time - Noah's Ark", date: "Nov 3, 2025", description: "Emma and friends finishing their rainbow animals craft.", thumbnail: "https://dq5pwpg1q8ru0.cloudfront.net/2023/06/26/07/26/57/cdb5067a-347d-4a08-97a2-40a3512bde37/BCC-Children%2527s-Ministry-%25281%2529.jpg" },
    { id: 2, title: "Worship & Music", date: "Nov 3, 2025", description: "Kids leading hand motions during the worship chorus.", thumbnail: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80" },
    { id: 3, title: "Outdoor Play", date: "Oct 27, 2025", description: "Recess time on the church playground before class.", thumbnail: "https://images.unsplash.com/photo-1469569941587-2d817f5b9c61?auto=format&fit=crop&w=900&q=80" }
];

const PARENT_CHAT_MESSAGES = [
    { id: 1, sender: 'Teacher Sarah', timestamp: 'Nov 1 • 10:30 AM', message: "Hi Jennifer! Emma did wonderfully today. She really enjoyed the Noah's Ark lesson and was very engaged during craft time." },
    { id: 2, sender: 'You', timestamp: 'Nov 1 • 11:15 AM', message: "Thank you so much! She was very excited to tell me about it when she got home." }
];

const PARENT_EVENTS = [
    { id: 1, name: 'Fall Festival', date: 'Nov 10, 2025', location: 'Church Parking Lot & Gymnasium', status: 'Registered', description: 'Games, food, and fun for the whole family.' },
    { id: 2, name: 'Thanksgiving Service Project', date: 'Nov 24, 2025', location: 'Fellowship Hall', status: 'Not Registered', description: 'Serve together by assembling care packages for families in need.' },
    { id: 3, name: 'Christmas Pageant', date: 'Dec 15, 2025', location: 'Main Sanctuary', status: 'Opens Dec 1', description: 'Annual Christmas production featuring every class.' }
];

const PARENT_ATTENDANCE = [
    { month: 'November 2025', present: 1, total: 1 },
    { month: 'October 2025', present: 4, total: 4 },
    { month: 'September 2025', present: 3, total: 4 },
    { month: 'August 2025', present: 3, total: 4 }
];

const PARENT_FOLLOWUP = [
    'Ask Emma how she can show kindness like Noah this week.',
    'Practice the memory verse as a family before bedtime.',
    'Bring a canned food donation for the service project next Sunday.'
];

let parentPanelState = {
    activePanel: 'default'
};

let parentDashboardData = null;

function normalizeParentDashboardData(raw = {}) {
    return {
        childId: raw.childId || currentUser.data?.child?.id || 'child-001',
        childName: raw.childName || currentUser.data?.child?.name || 'Emma Smith',
        className: raw.className || currentUser.data?.child?.class || 'Pre-K Room A',
        teacher: raw.teacher || currentUser.data?.child?.teacher || 'Sarah Martinez',
        lastUpdated: raw.lastUpdated || new Date().toISOString(),
        gallery: Array.isArray(raw.gallery) && raw.gallery.length ? [...raw.gallery] : [...PARENT_GALLERY_ITEMS],
        messages: Array.isArray(raw.messages) && raw.messages.length ? [...raw.messages] : [...PARENT_CHAT_MESSAGES],
        events: Array.isArray(raw.events) && raw.events.length ? [...raw.events] : [...PARENT_EVENTS],
        attendance: Array.isArray(raw.attendance) && raw.attendance.length ? [...raw.attendance] : [...PARENT_ATTENDANCE],
        followup: Array.isArray(raw.followup) && raw.followup.length ? [...raw.followup] : [...PARENT_FOLLOWUP],
        reports: raw.reports ? { ...raw.reports } : {
            attendance: '92%',
            memoryVerse: 'In Progress',
            nextStep: 'Encourage Emma to bring a friend to Fall Festival'
        }
    };
}

function renderActiveParentPanel() {
    switch (parentPanelState.activePanel) {
        case 'gallery':
            renderParentGallery();
            break;
        case 'chat':
            renderParentChat();
            break;
        case 'events':
            renderParentEvents();
            break;
        case 'reports':
            renderParentReports();
            break;
        default:
            break;
    }
}

function formatParentChatTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
}

let parentDashboardData = null;

function normalizeParentDashboardData(raw = {}) {
    return {
        childId: raw.childId || currentUser.data?.child?.id || 'child-001',
        childName: raw.childName || currentUser.data?.child?.name || 'Emma Smith',
        className: raw.className || currentUser.data?.child?.class || 'Pre-K Room A',
        teacher: raw.teacher || currentUser.data?.child?.teacher || 'Sarah Martinez',
        lastUpdated: raw.lastUpdated || new Date().toISOString(),
        gallery: Array.isArray(raw.gallery) && raw.gallery.length ? [...raw.gallery] : [...PARENT_GALLERY_ITEMS],
        messages: Array.isArray(raw.messages) && raw.messages.length ? [...raw.messages] : [...PARENT_CHAT_MESSAGES],
        events: Array.isArray(raw.events) && raw.events.length ? [...raw.events] : [...PARENT_EVENTS],
        attendance: Array.isArray(raw.attendance) && raw.attendance.length ? [...raw.attendance] : [...PARENT_ATTENDANCE],
        followup: Array.isArray(raw.followup) && raw.followup.length ? [...raw.followup] : [...PARENT_FOLLOWUP],
        reports: raw.reports ? { ...raw.reports } : {
            attendance: '92%',
            memoryVerse: 'In Progress',
            nextStep: 'Encourage Emma to bring a friend to Fall Festival'
        }
    };
}

function renderActiveParentPanel() {
    switch (parentPanelState.activePanel) {
        case 'gallery':
            renderParentGallery();
            break;
        case 'chat':
            renderParentChat();
            break;
        case 'events':
            renderParentEvents();
            break;
        case 'reports':
            renderParentReports();
            break;
        default:
            break;
    }
}

function formatParentChatTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
}

function resetParentPanel() {
    parentPanelState.activePanel = 'default';
    updateParentPanelUI();
}

async function openParentPanel(panelName) {
    if (!currentUser.loggedIn || currentUser.type !== 'parent') {
        showMessageToast('Please log in to the Parent Portal to access this tool.');
        return false;
    }

    const statusMessages = {
        gallery: 'Loading classroom photos...',
        chat: 'Opening your messages...',
        events: 'Checking upcoming events...',
        reports: 'Preparing your reports...'
    };

    try {
        await ensureParentDashboardData({
            forceRefresh: !parentDashboardData,
            statusMessage: statusMessages[panelName] || 'Loading your family tools...'
        });
    } catch (error) {
        console.error('Unable to load parent dashboard data:', error);
        showMessageToast('We could not load that tool. Please try again.');
        return false;
    }

    parentPanelState.activePanel = panelName;

    switch (panelName) {
        case 'gallery':
            renderParentGallery();
            updateParentPanelTitle('Class Photos', 'Latest uploads from Emma\'s classroom.');
            break;
        case 'chat':
            renderParentChat();
            updateParentPanelTitle('Message Teacher', 'Continue your conversation with Sarah Martinez.');
            break;
        case 'events':
            renderParentEvents();
            updateParentPanelTitle('Event Registration', 'Review Emma\'s registrations and upcoming events.');
            break;
        case 'reports':
            renderParentReports();
            updateParentPanelTitle('Attendance & Reports', 'See attendance history and suggested at-home follow-ups.');
            break;
        default:
            resetParentPanel();
            return false;
    }

    updateParentPanelUI();
    return true;
}

async function openParentChat() {
    const opened = await openParentPanel('chat');
    if (!opened) return;

    const input = document.getElementById('parent-chat-input');
    if (input && !input.disabled) {
        input.focus();
    }
}
async function openParentPanel(panelName) {
    if (!currentUser.loggedIn || currentUser.type !== 'parent') {
        showMessageToast('Please log in to the Parent Portal to access this tool.');
        return false;
    }

    const statusMessages = {
        gallery: 'Loading classroom photos...',
        chat: 'Opening your messages...',
        events: 'Checking upcoming events...',
        reports: 'Preparing your reports...'
    };

    try {
        await ensureParentDashboardData({
            forceRefresh: !parentDashboardData,
            statusMessage: statusMessages[panelName] || 'Loading your family tools...'
        });
    } catch (error) {
        console.error('Unable to load parent dashboard data:', error);
        showMessageToast('We could not load that tool. Please try again.');
        return false;
    }

    parentPanelState.activePanel = panelName;

    switch (panelName) {
        case 'gallery':
            renderParentGallery();
            updateParentPanelTitle('Class Photos', 'Latest uploads from Emma\'s classroom.');
            break;
        case 'chat':
            renderParentChat();
            updateParentPanelTitle('Message Teacher', 'Continue your conversation with Sarah Martinez.');
            break;
        case 'events':
            renderParentEvents();
            updateParentPanelTitle('Event Registration', 'Review Emma\'s registrations and upcoming events.');
            break;
        case 'reports':
            renderParentReports();
            updateParentPanelTitle('Attendance & Reports', 'See attendance history and suggested at-home follow-ups.');
            break;
        default:
            resetParentPanel();
            return false;
    }

    updateParentPanelUI();
    return true;
}

async function openParentChat() {
    const opened = await openParentPanel('chat');
    if (!opened) return;

    const input = document.getElementById('parent-chat-input');
    if (input && !input.disabled) {
        input.focus();
    }
}

function updateParentPanelTitle(title, subtitle) {
    const titleNode = document.getElementById('parent-panel-title');
    const subtitleNode = document.getElementById('parent-panel-subtitle');
    if (titleNode) titleNode.textContent = title;
    if (subtitleNode) subtitleNode.textContent = subtitle;
}

function updateParentPanelUI() {
    const sections = document.querySelectorAll('.parent-panel-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetId = parentPanelState.activePanel === 'default'
        ? 'parent-panel-default'
        : `parent-panel-${parentPanelState.activePanel}`;
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const wrapper = document.getElementById('parent-panel-wrapper');
    if (wrapper) {
        if (parentPanelState.activePanel === 'default') {
            wrapper.classList.remove('state-loading', 'state-error');
        }
    }

    if (parentPanelState.activePanel === 'default') {
        updateParentPanelTitle('Family tools', 'Select a feature card above to load details here.');
    }
}

function renderParentGallery() {
    const grid = document.getElementById('parent-gallery-grid');
    if (!grid) return;

    const galleryItems = parentDashboardData?.gallery ?? PARENT_GALLERY_ITEMS;

    if (galleryItems.length === 0) {
        grid.innerHTML = '<p class="panel-empty">No photos available yet. Check back after Sunday service.</p>';
        return;
    }

    grid.innerHTML = galleryItems.map(item => `
        <article class="parent-gallery-card">
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
            <div class="parent-gallery-meta">
                <span>${item.date}</span>
                <h5>${item.title}</h5>
function renderParentGallery() {
    const grid = document.getElementById('parent-gallery-grid');
    if (!grid) return;

    const galleryItems = parentDashboardData?.gallery ?? PARENT_GALLERY_ITEMS;

    if (galleryItems.length === 0) {
        grid.innerHTML = '<p class="panel-empty">No photos available yet. Check back after Sunday service.</p>';
        return;
    }

    grid.innerHTML = galleryItems.map(item => `
        <article class="parent-gallery-card">
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
            <div class="parent-gallery-meta">
                <span>${item.date}</span>
                <h5>${item.title}</h5>
                <p>${item.description}</p>
                <button class="btn btn-secondary" onclick="alert('Downloading photo: ${item.title} (Demo)')">Download</button>
            </div>
        </article>
    `).join('');
}

function renderParentChat() {
    const thread = document.getElementById('parent-chat-thread');
    if (!thread) return;

    const messages = parentDashboardData?.messages ?? PARENT_CHAT_MESSAGES;

    if (!messages.length) {
        thread.innerHTML = '<p class="panel-empty">No messages yet. Start the conversation with your teacher!</p>';
        return;
    }

    thread.innerHTML = messages.map(message => `
        <div class="parent-chat-bubble ${message.sender === 'You' ? 'from-parent' : 'from-teacher'}">
            <div class="parent-chat-meta">
                <strong>${message.sender}</strong>
                <span>${message.timestamp}</span>
            </div>
            <p>${message.message}</p>
        </div>
    `).join('');

    thread.scrollTop = thread.scrollHeight;
}

function renderParentEvents() {
    const list = document.getElementById('parent-events-list');
    if (!list) return;

    const events = parentDashboardData?.events ?? PARENT_EVENTS;

    if (!events.length) {
        list.innerHTML = '<p class="panel-empty">No upcoming events right now. Check back soon for new opportunities.</p>';
        return;
    }

    list.innerHTML = events.map(event => `
        <article class="parent-event-card">
            <header>
                <h5>${event.name}</h5>
                <span class="parent-event-status ${event.status.replace(/\s+/g, '-').toLowerCase()}">${event.status}</span>
            </header>
function renderParentChat() {
    const thread = document.getElementById('parent-chat-thread');
    if (!thread) return;

    const messages = parentDashboardData?.messages ?? PARENT_CHAT_MESSAGES;

    if (!messages.length) {
        thread.innerHTML = '<p class="panel-empty">No messages yet. Start the conversation with your teacher!</p>';
        return;
    }

    thread.innerHTML = messages.map(message => `
        <div class="parent-chat-bubble ${message.sender === 'You' ? 'from-parent' : 'from-teacher'}">
            <div class="parent-chat-meta">
                <strong>${message.sender}</strong>
                <span>${message.timestamp}</span>
            </div>
            <p>${message.message}</p>
        </div>
    `).join('');

    thread.scrollTop = thread.scrollHeight;
}

function renderParentEvents() {
    const list = document.getElementById('parent-events-list');
    if (!list) return;

    const events = parentDashboardData?.events ?? PARENT_EVENTS;

    if (!events.length) {
        list.innerHTML = '<p class="panel-empty">No upcoming events right now. Check back soon for new opportunities.</p>';
        return;
    }

    list.innerHTML = events.map(event => `
        <article class="parent-event-card">
            <header>
                <h5>${event.name}</h5>
                <span class="parent-event-status ${event.status.replace(/\s+/g, '-').toLowerCase()}">${event.status}</span>
            </header>
            <p class="parent-event-date">${event.date} • ${event.location}</p>
            <p>${event.description}</p>
            <div class="parent-event-actions">
                <button class="btn" onclick="alert('Managing registration for ${event.name} (Demo)')">Manage</button>
                <button class="btn btn-secondary" onclick="alert('Download itinerary for ${event.name} (Demo)')">Download Itinerary</button>
            </div>
        </article>
    `).join('');
}

function renderParentReports() {
    const cardsContainer = document.getElementById('parent-report-cards');
    const tableBody = document.getElementById('parent-attendance-body');
    const followupList = document.getElementById('parent-followup-list');

    const reports = parentDashboardData?.reports || {
        attendance: '92%',
        memoryVerse: 'In Progress',
        nextStep: 'Encourage Emma to bring a friend to Fall Festival'
    };
    const attendance = parentDashboardData?.attendance ?? PARENT_ATTENDANCE;
    const followup = parentDashboardData?.followup ?? PARENT_FOLLOWUP;

    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <article class="parent-report-card">
                <h5>Attendance</h5>
                <p><strong>${reports.attendance || '—'}</strong> attendance across the past 3 months.</p>
            </article>
            <article class="parent-report-card">
                <h5>Memory Verse</h5>
                <p>${reports.memoryVerse || 'Progress update coming soon.'}</p>
            </article>
            <article class="parent-report-card">
                <h5>Next Step</h5>
                <p>${reports.nextStep || 'Check back soon for a suggested next step.'}</p>
            </article>
        `;
    }

    if (tableBody) {
        if (!attendance.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">Attendance details will appear after Emma's next check-in.</td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = attendance.map(row => {
                const totalSessions = row.total || 0;
                const percentage = totalSessions ? Math.round((row.present / totalSessions) * 100) : 0;
                return `
                    <tr>
                        <td>${row.month}</td>
                        <td>${row.present}</td>
                        <td>${row.total}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            }).join('');
        }
    }

    if (followupList) {
        followupList.innerHTML = followup.length
            ? followup.map(item => `<li>${item}</li>`).join('')
            : '<li>No follow-up steps right now. Enjoy time together as a family!</li>';
    }
}
function renderParentReports() {
    const cardsContainer = document.getElementById('parent-report-cards');
    const tableBody = document.getElementById('parent-attendance-body');
    const followupList = document.getElementById('parent-followup-list');

    const reports = parentDashboardData?.reports || {
        attendance: '92%',
        memoryVerse: 'In Progress',
        nextStep: 'Encourage Emma to bring a friend to Fall Festival'
    };
    const attendance = parentDashboardData?.attendance ?? PARENT_ATTENDANCE;
    const followup = parentDashboardData?.followup ?? PARENT_FOLLOWUP;

    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <article class="parent-report-card">
                <h5>Attendance</h5>
                <p><strong>${reports.attendance || '—'}</strong> attendance across the past 3 months.</p>
            </article>
            <article class="parent-report-card">
                <h5>Memory Verse</h5>
                <p>${reports.memoryVerse || 'Progress update coming soon.'}</p>
            </article>
            <article class="parent-report-card">
                <h5>Next Step</h5>
                <p>${reports.nextStep || 'Check back soon for a suggested next step.'}</p>
            </article>
        `;
    }

    if (tableBody) {
        if (!attendance.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">Attendance details will appear after Emma's next check-in.</td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = attendance.map(row => {
                const totalSessions = row.total || 0;
                const percentage = totalSessions ? Math.round((row.present / totalSessions) * 100) : 0;
                return `
                    <tr>
                        <td>${row.month}</td>
                        <td>${row.present}</td>
                        <td>${row.total}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            }).join('');
        }
    }

    if (followupList) {
        followupList.innerHTML = followup.length
            ? followup.map(item => `<li>${item}</li>`).join('')
            : '<li>No follow-up steps right now. Enjoy time together as a family!</li>';
    }
}

function downloadParentReport() {
    alert('Generating personalized PDF report for Emma (Demo)');
}

// Parent Portal Features
function openChat(userType) {
    if (userType === 'teacher') {
        // Check if user is logged in as teacher
        if (!currentUser.loggedIn || currentUser.type !== 'teacher') {
            alert('Please log in to the Teacher Portal to access messages.');
            return;
        }
        showPage('teacher-messages');
        loadConversations();
    } else if (userType === 'parent') {
        openParentChat();
    }
}

// Teacher Portal Features
let teacherPhotoDrafts = JSON.parse(localStorage.getItem('bccTeacherPhotoDrafts') || '[]');

function uploadPhotos() {
    if (!currentUser.loggedIn || currentUser.type !== 'teacher') {
        showToast('Please log in as a teacher to upload photos.', true);
        return;
    }

    const modal = document.getElementById('teacher-photo-modal');
    if (!modal) return;

    resetTeacherPhotoForm();

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const fileInput = document.getElementById('teacher-photo-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleTeacherPhotoSelection);
    }
}

function takeAttendance() {
    alert('✓ Take Attendance\n\n' +
          'Pre-K Room A - November 3, 2025\n\n' +
          'Students:\n' +
          '☑ Emma Smith\n' +
          '☑ Michael Johnson\n' +
          '☑ Sophia Davis\n' +
          '☐ Noah Williams (absent)\n' +
          '☑ Olivia Martinez\n' +
          '☑ Liam Anderson\n' +
          '☑ Ava Thompson\n' +
          '☑ Ethan Garcia\n' +
          '☑ Isabella Rodriguez\n' +
          '☑ Mason Lee\n' +
          '☑ Charlotte Harris\n' +
          '☑ James Wilson\n\n' +
          'Present: 11 / Absent: 1\n\n' +
          '(Demo mode - Digital attendance tracking)');
}

function viewReports() {
    alert('📋 Class Reports\n\n' +
          'Available Reports:\n\n' +
          '• Attendance Summary (Monthly)\n' +
          '• Student Progress Reports\n' +
          '• Parent Engagement Metrics\n' +
          '• Lesson Completion Tracking\n' +
          '• Event Participation\n' +
          '• Volunteer Hours\n\n' +
          'Export Options:\n' +
          '○ PDF\n' +
          '○ Excel\n' +
          '○ CSV\n\n' +
          '(Demo mode - Comprehensive reporting system)');
}

// Event Registration
function hydrateAdminDashboard() {
    const pendingApprovals = document.querySelectorAll('#admin-task-list li').length;

    const coverageEl = document.getElementById('admin-coverage');
    const backgroundEl = document.getElementById('admin-background');
    const checkinsEl = document.getElementById('admin-checkins');

    if (coverageEl) coverageEl.textContent = '96% staffed for November';
    if (backgroundEl) backgroundEl.textContent = '3 pending renewals';
    if (checkinsEl) checkinsEl.textContent = 'Avg 2m 15s per family';

    const auditDateEl = document.getElementById('admin-audit-date');
    const twofaRateEl = document.getElementById('admin-2fa-rate');
    const trainingEl = document.getElementById('admin-training');

    if (auditDateEl) auditDateEl.textContent = 'Oct 30, 2025';
    if (twofaRateEl) twofaRateEl.textContent = '100% of admins enabled';
    if (trainingEl) trainingEl.textContent = 'Renewal cycle opens Dec 1';

    showToast(`Admin dashboard hydrated • ${pendingApprovals} tasks in queue`);
}

function approveVolunteer(name) {
    showToast(`Volunteer ${name} approved!`);
}

function reviewIncident(reportName) {
    showToast(`${reportName} opened for review.`);
}

function publishCurriculum() {
    showToast('Advent curriculum published. Families notified.');
}

function openAdminReportCenter() {
    showToast('Opening ministry analytics (demo).');
}

function openAdminTaskQueue() {
    showToast('Task queue loaded (demo).');
}

function viewSecurityAudit() {
    showToast('Security audit log ready (demo).');
}

function openStaffManagement() {
    if (!currentUser.loggedIn || currentUser.type !== 'admin') {
        showToast('Admin login required to manage staffing.', true);
        return;
    }

    const modal = document.getElementById('staff-management-modal');
    if (!modal) {
        showToast('Staff manager unavailable right now.', true);
        return;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    hydrateStaffManager();

    const closeButtons = [
        document.getElementById('staff-management-close'),
        document.getElementById('staff-close-footer')
    ];

    closeButtons.forEach(btn => {
        if (btn) {
            btn.onclick = () => closeStaffManagement();
        }
    });

    document.addEventListener('keydown', handleStaffModalKeydown);
}

function configureCheckIn() {
    if (!currentUser.loggedIn || currentUser.type !== 'admin') {
        showToast('Admin login required to configure check-in.', true);
        return;
    }
    showToast('Check-in configuration coming soon.');
}

function openBudgetPlanner() {
    if (!currentUser.loggedIn || currentUser.type !== 'admin') {
        showToast('Admin login required to review budget.', true);
        return;
    }
    showToast('Budget planner module loading (demo).');
}

function closeStaffManagement() {
    const modal = document.getElementById('staff-management-modal');
    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    document.removeEventListener('keydown', handleStaffModalKeydown);
}

function resetTeacherPhotoForm() {
    const form = document.getElementById('teacher-photo-form');
    const preview = document.getElementById('teacher-photo-preview');
    const errors = document.getElementById('teacher-photo-errors');

    if (form) form.reset();
    if (preview) preview.innerHTML = '';
    if (errors) errors.textContent = '';
}

function handleStaffModalKeydown(event) {
    if (event.key === 'Escape') {
        closeStaffManagement();
    }
}

const STAFF_ROSTER = [
    {
        name: 'Sarah Martinez',
        role: 'Lead Teacher',
        roleGroup: 'teacher',
        team: 'Pre-K Room A',
        status: 'active',
        clearance: 'Cleared',
        clearanceAlert: false,
        nextServing: 'Nov 17 • 9:00 AM',
        email: 'sarah.martinez@bengalchurch.org'
    },
    {
        name: 'Michael Johnson',
        role: 'Assistant Teacher',
        roleGroup: 'assistant',
        team: 'Pre-K Room A',
        status: 'active',
        clearance: 'Cleared',
        clearanceAlert: false,
        nextServing: 'Nov 24 • 9:00 AM',
        email: 'michael.johnson@bengalchurch.org'
    },
    {
        name: 'Emily Chen',
        role: 'Volunteer Coordinator',
        roleGroup: 'admin',
        team: 'Leadership',
        status: 'active',
        clearance: 'Renewal due 12/15',
        clearanceAlert: true,
        nextServing: 'Weekly',
        email: 'emily.chen@bengalchurch.org'
    },
    {
        name: 'David Anderson',
        role: 'Security Lead',
        roleGroup: 'security',
        team: 'Safety',
        status: 'active',
        clearance: 'Cleared',
        clearanceAlert: false,
        nextServing: 'Nov 10 • 8:30 AM',
        email: 'david.anderson@bengalchurch.org'
    },
    {
        name: 'Rachel Thompson',
        role: 'New Volunteer',
        roleGroup: 'volunteer',
        team: 'Elementary',
        status: 'pending',
        clearance: 'Background check in progress',
        clearanceAlert: true,
        nextServing: 'TBD',
        email: 'rachel.thompson@gmail.com'
    },
    {
        name: 'James Garcia',
        role: 'Small Group Leader',
        roleGroup: 'volunteer',
        team: 'Elementary',
        status: 'inactive',
        clearance: 'Paused',
        clearanceAlert: false,
        nextServing: 'On leave',
        email: 'james.garcia@gmail.com'
    }
];

const STAFF_OPEN_ROLES = [
    {
        title: 'Elementary Lead Teacher',
        team: 'Elementary Large Group',
        coverage: 'Needs coverage Nov 24 & Dec 1'
    },
    {
        title: 'Security Greeter',
        team: 'Safety Team',
        coverage: 'Looking for 2 people for 10:30 rotation'
    },
    {
        title: 'Check-In Specialist',
        team: 'Guest Services',
        coverage: 'Supports new families at kiosk, Sundays 9:00 AM'
    }
];

const STAFF_TRAINING_EVENTS = [
    {
        title: 'Safe Families Renewal',
        date: 'Nov 16 • 6:30 PM',
        detail: 'Required for all volunteers expiring in 2025'
    },
    {
        title: 'Emergency Drill Walkthrough',
        date: 'Nov 23 • 12:00 PM',
        detail: 'Security & leadership teams review updates'
    },
    {
        title: 'New Volunteer Orientation',
        date: 'Dec 4 • 7:00 PM',
        detail: 'Onboarding for December cohort'
    }
];

const VOLUNTEER_ROLES = [
    {
        id: 'lead-teacher',
        name: 'Lead Teacher',
        icon: '👨‍🏫',
        summary: 'Facilitate the main Bible lesson each week.',
        commitment: '1-2 Sundays per month',
        focus: 'Teaching & large group leadership'
    },
    {
        id: 'small-group-leader',
        name: 'Small Group Leader',
        icon: '🤝',
        summary: 'Lead a small group of 6-8 children in discussion and activities.',
        commitment: 'Weekly',
        focus: 'Relationships & discipleship'
    },
    {
        id: 'greeter',
        name: 'Family Check-In Greeter',
        icon: '🙋‍♀️',
        summary: 'Welcome new families and assist with secure check-in.',
        commitment: 'Twice per month',
        focus: 'Hospitality & guest services'
    }
];

let volunteerApplications = JSON.parse(localStorage.getItem('bccVolunteerApplications') || '[]');
let currentVolunteerRole = null;


function hydrateStaffManager() {
    if (!currentUser.loggedIn || currentUser.type !== 'admin') return;

    renderStaffOpenRoles();
    renderStaffUpcomingTraining();

    const searchInput = document.getElementById('staff-search-input');
    const roleFilter = document.getElementById('staff-role-filter');
    const statusFilter = document.getElementById('staff-status-filter');

    if (searchInput) {
        searchInput.oninput = () => {
            renderStaffTable();
        };
    }
    if (roleFilter) {
        roleFilter.onchange = () => {
            renderStaffTable();
        };
    }
    if (statusFilter) {
        statusFilter.onchange = () => {
            renderStaffTable();
        };
    }

    renderStaffTable();

    const exportBtn = document.getElementById('staff-export-btn');
    if (exportBtn) {
        exportBtn.onclick = () => showToast('Exporting staffing roster (demo).');
    }

    const addBtn = document.getElementById('staff-add-btn');
    if (addBtn) {
        addBtn.onclick = () => showToast('Launching onboarding workflow (demo).');
    }

    const saveBtn = document.getElementById('staff-save-plan');
    if (saveBtn) {
        saveBtn.onclick = () => showToast('Staffing updates saved (demo).');
    }

    renderVolunteerRoles();
    hydrateVolunteerModal();
}

function renderVolunteerRoles() {
    const grid = document.getElementById('volunteer-role-grid');
    if (!grid) return;

    grid.innerHTML = VOLUNTEER_ROLES.map(role => `
        <article class="card volunteer-role-card" data-role-id="${role.id}" tabindex="0" role="button" aria-pressed="false">
            <div class="card-icon">${role.icon}</div>
            <h3>${role.name}</h3>
            <p>${role.summary}</p>
            <p class="volunteer-role-meta"><strong>Commitment:</strong> ${role.commitment}<br><strong>Focus:</strong> ${role.focus}</p>
        </article>
    `).join('');

    grid.querySelectorAll('.volunteer-role-card').forEach(card => {
        card.addEventListener('click', () => openVolunteerApplication(card.dataset.roleId));
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openVolunteerApplication(card.dataset.roleId);
            }
        });
    });
}

function hydrateVolunteerModal() {
    const modal = document.getElementById('volunteer-application-modal');
    if (!modal) return;

    const closeButton = document.getElementById('volunteer-modal-close');
    const cancelButton = document.getElementById('volunteer-modal-cancel');

    [closeButton, cancelButton].forEach(btn => {
        if (btn) {
            btn.onclick = () => closeVolunteerApplication();
        }
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeVolunteerApplication();
        }
    });

    const form = document.getElementById('volunteer-application-form');
    if (form) {
        form.addEventListener('submit', handleVolunteerApplicationSubmit);
    }
}

function openVolunteerApplication(roleId) {
    const role = VOLUNTEER_ROLES.find(item => item.id === roleId);
    if (!role) return;

    currentVolunteerRole = role;

    const modal = document.getElementById('volunteer-application-modal');
    const roleHeading = document.getElementById('volunteer-modal-role');
    const note = document.getElementById('volunteer-form-note');

    if (roleHeading) {
        roleHeading.textContent = `${role.name} • ${role.commitment}`;
    }

    if (note) {
        note.textContent = `You are applying for ${role.name}. We’ll follow up by email within 2 business days.`;
    }

    document.getElementById('volunteer-name').value = '';
    document.getElementById('volunteer-email').value = '';
    document.getElementById('volunteer-phone').value = '';
    document.getElementById('volunteer-availability').value = '';
    document.getElementById('volunteer-comments').value = '';
    clearVolunteerErrors();

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    document.getElementById('volunteer-name').focus();
}

function closeVolunteerApplication() {
    const modal = document.getElementById('volunteer-application-modal');
    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    currentVolunteerRole = null;

    const form = document.getElementById('volunteer-application-form');
    if (form) form.reset();
}

function handleVolunteerApplicationSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    clearVolunteerErrors();

    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const availability = formData.get('availability');
    const phone = formData.get('phone').trim();
    const comments = formData.get('comments').trim();

    let hasError = false;

    if (!name) {
        setVolunteerError('volunteer-name', 'Please enter your name.');
        hasError = true;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setVolunteerError('volunteer-email', 'Enter a valid email address.');
        hasError = true;
    }

    if (!availability) {
        setVolunteerError('volunteer-availability', 'Tell us how often you can serve.');
        hasError = true;
    }

    if (!currentVolunteerRole) {
        showToast('Please choose a role before applying.', true);
        hasError = true;
    }

    if (hasError) {
        return;
    }

    const application = {
        id: `app-${Date.now()}`,
        roleId: currentVolunteerRole.id,
        roleName: currentVolunteerRole.name,
        name,
        email,
        phone,
        availability,
        comments,
        submittedAt: new Date().toISOString()
    };

    volunteerApplications.push(application);
    localStorage.setItem('bccVolunteerApplications', JSON.stringify(volunteerApplications));

    showToast('Application submitted! We will contact you soon.');
    closeVolunteerApplication();
}

function clearVolunteerErrors() {
    document.querySelectorAll('.form-error').forEach(node => {
        node.textContent = '';
    });
}

function setVolunteerError(inputId, message) {
    const errorNode = document.querySelector(`[data-error-for="${inputId}"]`);
    if (errorNode) {
        errorNode.textContent = message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('teacher-photo-modal-close');
    const cancelBtn = document.getElementById('teacher-photo-modal-cancel');
    const form = document.getElementById('teacher-photo-form');
    const saveDraftBtn = document.getElementById('teacher-photo-save-draft');

    if (closeBtn) closeBtn.onclick = () => closeTeacherPhotoModal();
    if (cancelBtn) cancelBtn.onclick = () => closeTeacherPhotoModal();
    if (form) form.addEventListener('submit', handleTeacherPhotoFormSubmit);
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', handleTeacherPhotoDraftSave);
});

function handleTeacherPhotoSelection(event) {
    const files = Array.from(event.target.files || []);
    const preview = document.getElementById('teacher-photo-preview');
    const errors = document.getElementById('teacher-photo-errors');

    if (!preview || !errors) return;

    preview.innerHTML = '';
    errors.textContent = '';

    if (files.length === 0) {
        errors.textContent = 'No photos selected yet.';
        return;
    }

    if (files.length > 8) {
        errors.textContent = 'Please select up to 8 photos at a time.';
        return;
    }

    const fragment = document.createDocumentFragment();

    files.forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            errors.textContent = 'Each photo must be 10MB or smaller.';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const card = document.createElement('article');
            card.className = 'teacher-photo-card';
            card.innerHTML = `
                <button type="button" class="teacher-photo-remove" aria-label="Remove photo" data-photo-index="${index}">×</button>
                <img src="${reader.result}" alt="Selected photo preview" />
                <textarea placeholder="Optional caption for parents"></textarea>
            `;
            fragment.appendChild(card);

            card.querySelector('.teacher-photo-remove').addEventListener('click', () => {
                card.remove();
                removeTeacherPhotoAt(index);
            });
        };
        reader.readAsDataURL(file);
    });

    preview.appendChild(fragment);
}

function removeTeacherPhotoAt(index) {
    const input = document.getElementById('teacher-photo-input');
    if (!input || !input.files) return;

    const dt = new DataTransfer();
    Array.from(input.files).forEach((file, fileIndex) => {
        if (fileIndex !== index) {
            dt.items.add(file);
        }
    });
    input.files = dt.files;

    handleTeacherPhotoSelection({ target: input });
}

function closeTeacherPhotoModal() {
    const modal = document.getElementById('teacher-photo-modal');
    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    const input = document.getElementById('teacher-photo-input');
    if (input) {
        input.value = '';
        input.removeEventListener('change', handleTeacherPhotoSelection);
    }
}

function handleTeacherPhotoFormSubmit(event) {
    event.preventDefault();

    const input = document.getElementById('teacher-photo-input');
    const classroom = document.getElementById('teacher-photo-class');
    const errors = document.getElementById('teacher-photo-errors');

    if (!input || !classroom || !errors) return;

    errors.textContent = '';

    if (!input.files || input.files.length === 0) {
        errors.textContent = 'Please select at least one photo to publish.';
        return;
    }

    if (!classroom.value) {
        errors.textContent = 'Select a classroom to share these photos with.';
        return;
    }

    const notes = document.getElementById('teacher-photo-notes').value.trim();
    const featured = document.getElementById('teacher-photo-featured').checked;
    const notify = document.getElementById('teacher-photo-notify').checked;

    const payload = {
        id: `gallery-${Date.now()}`,
        teacher: currentUser?.data?.name || 'Teacher',
        classroom: classroom.value,
        notes,
        featured,
        notify,
        files: Array.from(input.files).map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
        })),
        submittedAt: new Date().toISOString()
    };

    sessionStorage.setItem(payload.id, JSON.stringify(payload));
    showToast(`${input.files.length} photo${input.files.length > 1 ? 's' : ''} scheduled for review.`);

    closeTeacherPhotoModal();
}

function handleTeacherPhotoDraftSave() {
    const input = document.getElementById('teacher-photo-input');
    const classroom = document.getElementById('teacher-photo-class');
    const notes = document.getElementById('teacher-photo-notes');

    if (!input || !classroom || !notes) return;

    const draft = {
        id: `draft-${Date.now()}`,
        classroom: classroom.value,
        notes: notes.value.trim(),
        files: Array.from(input.files || []).map(file => ({ name: file.name, size: file.size })),
        savedAt: new Date().toISOString()
    };

    teacherPhotoDrafts.push(draft);
    localStorage.setItem('bccTeacherPhotoDrafts', JSON.stringify(teacherPhotoDrafts));

    showToast('Draft saved. You can finish it anytime.');
}

function renderStaffOpenRoles() {
    const list = document.getElementById('staff-open-roles');
    if (!list) return;

    list.innerHTML = STAFF_OPEN_ROLES.map(role => `
        <li>
            <strong>${role.title}</strong>
            <span>${role.team}</span>
            <small>${role.coverage}</small>
        </li>
    `).join('');
}

function renderStaffUpcomingTraining() {
    const list = document.getElementById('staff-upcoming-training');
    if (!list) return;

    list.innerHTML = STAFF_TRAINING_EVENTS.map(event => `
        <li>
            <strong>${event.title}</strong>
            <span>${event.date}</span>
            <span>${event.detail}</span>
        </li>
    `).join('');
}

function formatStaffStatus(status) {
    if (status === 'active') return 'Active';
    if (status === 'pending') return 'Pending';
    return 'Inactive';
}

function registerForEvent(eventName) {
    alert('🛒 Cart-Style Event Registration\n\n' +
          'Event: ' + eventName + '\n\n' +
          'Step 1: Select participants\n' +
          '☑ Emma Smith (Age 4)\n\n' +
          'Step 2: Additional options\n' +
          '○ T-shirt size: ___\n' +
          '○ Dietary restrictions: ___\n' +
          '○ Photo consent: [Yes/No]\n\n' +
          'Step 3: Emergency contact\n' +
          'Step 4: Review and confirm\n\n' +
          '(Demo mode - Multi-step registration process)');
}

// Form Handlers
function handleContactForm(event) {
    event.preventDefault();
    alert('Thank you! Your message has been sent.\n\nWe\'ll respond within 24 hours.\n\n(Demo mode)');
    event.target.reset();
}

function initializeSubNavigation() {
    const subNav = document.querySelector('.sub-nav');
    if (!subNav || subNav.dataset.bound === 'true') return;

    subNav.addEventListener('click', event => {
        const link = event.target.closest('a[data-target]');
        if (!link || !subNav.contains(link)) {
            return;
        }

        const target = link.getAttribute('data-target');
        if (!target) {
            return;
        }

        event.preventDefault();
        showPage(target);
    });

    subNav.dataset.bound = 'true';
}

function initializeParentDashboardControls() {
    const triggers = document.querySelectorAll('.parent-panel-trigger');
    triggers.forEach(trigger => {
        if (trigger.dataset.bound === 'true') return;

        trigger.addEventListener('click', async event => {
            event.preventDefault();
            const panel = trigger.getAttribute('data-panel');
            if (!panel) return;

            if (panel === 'chat') {
                await openParentChat();
                return;
            }

            await openParentPanel(panel);
        });

        trigger.dataset.bound = 'true';
    });

    const resetButton = document.querySelector('.parent-panel-reset');
    if (resetButton && resetButton.dataset.bound !== 'true') {
        resetButton.addEventListener('click', event => {
            event.preventDefault();
            resetParentPanel();
        });
        resetButton.dataset.bound = 'true';
    }

    const refreshButtons = document.querySelectorAll('[data-refresh-panel]');
    refreshButtons.forEach(button => {
        if (button.dataset.bound === 'true') return;

        button.addEventListener('click', async event => {
            event.preventDefault();
            const panel = button.getAttribute('data-refresh-panel');
            if (!panel) return;
            await openParentPanel(panel);
        });

        button.dataset.bound = 'true';
    });
}

// Document Ready
document.addEventListener('DOMContentLoaded', function() {
    renderLessonPlans();
    renderClassCodesList();

    initializeSubNavigation();
    initializeParentDashboardControls();

    const forms = document.querySelectorAll('form:not(#parent-login-form):not(#teacher-login-form):not(#lesson-plan-form):not(#admin-login-form)');
    forms.forEach(form => {
        if (!form.onsubmit && form.id !== 'contact-form') {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                showToast('Thank you! Your form has been submitted. (Demo mode)');
                form.reset();
            });
        }
    });

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            showToast('Photo viewer requires Parent Portal login.', true);
        });
    });

    const resourceItems = document.querySelectorAll('.resource-item');
    resourceItems.forEach(item => {
        item.addEventListener('click', function() {
            const name = item.querySelector('strong').textContent;
            showToast('Downloading: ' + name + ' (demo)');
        });
    });

    const staffModal = document.getElementById('staff-management-modal');
    if (staffModal) {
        staffModal.addEventListener('click', function(event) {
            if (event.target === staffModal) {
                closeStaffManagement();
            }
        });
    }

    const registerButtons = document.querySelectorAll('.register-btn');
    registerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const eventName = button.getAttribute('data-event-name');
            registerForEvent(eventName);
        });
    });

    renderVolunteerRoles();
    hydrateVolunteerModal();

    const parentChatForm = document.getElementById('parent-chat-form');
    if (parentChatForm) {
        parentChatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleParentChatSubmit();
        });
    }

    if (document.getElementById('teacher-role-toggle')) {
        setStaffLoginRole('teacher');
    }

    resetParentPanel();
});
// Message data store
let CONVERSATIONS = [
    {
        id: 1,
        parentId: 1,
        parentName: 'Jennifer Smith',
        childName: 'Emma Smith',
        childClass: 'Pre-K Room A',
        lastMessage: 'Thank you so much! She was very excited to tell me about it when she got home.',
        lastMessageTime: new Date('2025-11-01T11:15:00'),
        unread: 0,
        messages: [
            {
                id: 1,
                sender: 'teacher',
                text: 'Hi Jennifer! Emma did wonderfully today. She really enjoyed the Noah\'s Ark lesson and was very engaged during craft time.',
                timestamp: new Date('2025-11-01T10:30:00'),
                read: true
            },
            {
                id: 2,
                sender: 'parent',
                text: 'Thank you so much! She was very excited to tell me about it when she got home.',
                timestamp: new Date('2025-11-01T11:15:00'),
                read: true
            }
        ]
    },
    {
        id: 2,
        parentId: 2,
        parentName: 'Michael Johnson',
        childName: 'Noah Johnson',
        childClass: 'Pre-K Room A',
        lastMessage: 'Thanks! I appreciate it.',
        lastMessageTime: new Date('2025-11-01T16:20:00'),
        unread: 1,
        messages: [
            {
                id: 1,
                sender: 'parent',
                text: 'Can you send me the memory verse for this week?',
                timestamp: new Date('2025-11-01T16:20:00'),
                read: false
            }
        ]
    },
    {
        id: 3,
        parentId: 3,
        parentName: 'Lisa Davis',
        childName: 'Sophia Davis',
        childClass: 'Pre-K Room A',
        lastMessage: 'Thank you for the wonderful Fall Festival!',
        lastMessageTime: new Date('2025-10-31T14:30:00'),
        unread: 1,
        messages: [
            {
                id: 1,
                sender: 'parent',
                text: 'Thank you for the wonderful Fall Festival! Sophia had such a great time!',
                timestamp: new Date('2025-10-31T14:30:00'),
                read: false
            }
        ]
    },
    {
        id: 4,
        parentId: 4,
        parentName: 'Sarah Williams',
        childName: 'Liam Williams',
        childClass: 'Pre-K Room A',
        lastMessage: 'He\'s been practicing at home!',
        lastMessageTime: new Date('2025-10-29T09:45:00'),
        unread: 0,
        messages: [
            {
                id: 1,
                sender: 'teacher',
                text: 'Liam did a great job with his memory verse today!',
                timestamp: new Date('2025-10-28T15:20:00'),
                read: true
            },
            {
                id: 2,
                sender: 'parent',
                text: 'That\'s wonderful to hear! He\'s been practicing at home!',
                timestamp: new Date('2025-10-29T09:45:00'),
                read: true
            }
        ]
    },
    {
        id: 5,
        parentId: 5,
        parentName: 'Amanda Martinez',
        childName: 'Olivia Martinez',
        childClass: 'Pre-K Room A',
        lastMessage: 'Will do, thanks for letting me know.',
        lastMessageTime: new Date('2025-10-27T12:10:00'),
        unread: 0,
        messages: [
            {
                id: 1,
                sender: 'teacher',
                text: 'Just a reminder that we have a field trip permission slip due this Friday.',
                timestamp: new Date('2025-10-26T14:00:00'),
                read: true
            },
            {
                id: 2,
                sender: 'parent',
                text: 'Will do, thanks for letting me know.',
                timestamp: new Date('2025-10-27T12:10:00'),
                read: true
            }
        ]
    }
];

// All parents in the class (for new conversation)
const CLASS_PARENTS = [
    { id: 1, name: 'Jennifer Smith', childName: 'Emma Smith' },
    { id: 2, name: 'Michael Johnson', childName: 'Noah Johnson' },
    { id: 3, name: 'Lisa Davis', childName: 'Sophia Davis' },
    { id: 4, name: 'Sarah Williams', childName: 'Liam Williams' },
    { id: 5, name: 'Amanda Martinez', childName: 'Olivia Martinez' },
    { id: 6, name: 'David Anderson', childName: 'Ava Anderson' },
    { id: 7, name: 'Rachel Thompson', childName: 'Ethan Thompson' },
    { id: 8, name: 'James Garcia', childName: 'Isabella Garcia' },
    { id: 9, name: 'Emily Rodriguez', childName: 'Mason Rodriguez' },
    { id: 10, name: 'Robert Lee', childName: 'Charlotte Lee' },
    { id: 11, name: 'Maria Harris', childName: 'James Harris' },
    { id: 12, name: 'Thomas Wilson', childName: 'Mia Wilson' }
];

let currentConversationId = null;

// Update the openChat function to navigate to messages page
function showToast(message, isError = false) {
    let toast = document.getElementById('message-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'message-toast';
        toast.className = 'message-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function setFormFeedback(message = '', isError = false) {
    const feedback = document.getElementById('parent-admin-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove('error', 'success');

    if (!message) return;

    feedback.classList.add(isError ? 'error' : 'success');
}

function updateAdminAccessCodePreview() {
    const classSelect = document.getElementById('parent-admin-class');
    const codeInput = document.getElementById('parent-admin-access-code');
    if (!classSelect || !codeInput) return;

    const classroom = getClassById(classSelect.value);
    codeInput.value = classroom ? classroom.accessCode : '';
}

function renderAdminParentTable(filterClassId = 'all') {
    const tbody = document.getElementById('admin-parent-table-body');
    if (!tbody) return;

    const accounts = getParentAccountsByClass(filterClassId);
    if (accounts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 2rem; color: #5d6d7e;">
                    No parent accounts yet. Create the first family account to see it listed here.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = accounts.map(account => {
        const classroom = getClassById(account.classId);
        return `
            <tr>
                <td>${account.name}</td>
                <td>${account.email}</td>
                <td>${account.childName}</td>
                <td>${classroom?.displayName || account.classId}</td>
                <td><span class="parent-access-chip">${classroom?.accessCode || account.accessCode}</span></td>
                <td>${new Date(account.createdAt).toLocaleString()}</td>
            </tr>
        `;
    }).join('');
}

function handleAdminParentCreate(event) {
    event.preventDefault();
    const form = event.target;

    const formData = {
        name: form['parentName'].value.trim(),
        email: form['parentEmail'].value.trim(),
        password: form['parentPassword'].value.trim(),
        childName: form['childName'].value.trim(),
        classId: form['parent-admin-class'].value
    };

    try {
        const newAccount = createParentAccount(formData);
        renderAdminParentTable(document.getElementById('parent-admin-filter')?.value || 'all');
        renderClassCodesList();
        renderAdminClassAccess();
        form.reset();
        updateAdminAccessCodePreview();
        setFormFeedback(`Parent account created for ${newAccount.name}. Share code ${newAccount.accessCode}.`);
    } catch (error) {
        setFormFeedback(error.message, true);
    }
}

function showAdminParentPanel() {
    renderClassCodesList();
    renderAdminClassAccess();
    renderAdminParentTable(document.getElementById('parent-admin-filter')?.value || 'all');

    const classSelect = document.getElementById('parent-admin-class');
    if (classSelect) {
        classSelect.innerHTML = CLASSROOMS.map(room => `
            <option value="${room.id}">${room.displayName}</option>
        `).join('');
        classSelect.onchange = updateAdminAccessCodePreview;
        updateAdminAccessCodePreview();
    }

    const filterSelect = document.getElementById('parent-admin-filter');
    if (filterSelect) {
        filterSelect.innerHTML = ['<option value="all">All classrooms</option>', ...CLASSROOMS.map(room => `
            <option value="${room.id}">${room.displayName}</option>
        `)].join('');
        filterSelect.onchange = () => renderAdminParentTable(filterSelect.value);
    }

    const exportButton = document.getElementById('parent-admin-export');
    if (exportButton) {
        exportButton.onclick = exportParentAccountsToCSV;
    }

    const form = document.getElementById('admin-parent-create-form');
    if (form && !form.dataset.bound) {
        form.addEventListener('submit', handleAdminParentCreate);
        form.dataset.bound = 'true';
    }

    const resetBtn = document.getElementById('parent-admin-reset');
    if (resetBtn) {
        resetBtn.onclick = () => {
            form?.reset();
            updateAdminAccessCodePreview();
            setFormFeedback();
        };
    }

    const parentLoginAnnounce = document.getElementById('parent-login-announcement');
    if (parentLoginAnnounce) {
        parentLoginAnnounce.textContent = formatParentLoginAnnouncement();
    }
}

function formatParentLoginAnnouncement() {
    const accounts = getAllParentAccounts();
    const latest = accounts[0];
    if (!latest) {
        return 'Sign in with your email and password to access family updates.';
    }

    const classroom = getClassById(latest.classId);
    return `${latest.name} connected for ${classroom?.displayName || latest.classId}.`;
}
function formatParentLoginAnnouncement() {
    const accounts = getAllParentAccounts();
    const latest = accounts[0];
    if (!latest) {
        return 'Sign in with your email and password to access family updates.';
    }

    const classroom = getClassById(latest.classId);
    return `${latest.name} connected for ${classroom?.displayName || latest.classId}.`;
}

function renderClassCodesList() {
    const list = document.getElementById('parent-class-codes-list');
    if (!list) return;

    list.innerHTML = CLASSROOMS.map(room => `
        <li>
            <div>
                <strong>${room.displayName}</strong>
                <p>Teacher: ${room.teacher}</p>
            </div>
            <span class="parent-access-chip">${room.accessCode}</span>
        </li>
    `).join('');
}

function renderAdminClassAccess() {
    const accessList = document.getElementById('admin-class-access-list');
    if (!accessList) return;

    accessList.innerHTML = CLASSROOMS.map(room => `
        <li>
            <span>${room.displayName}</span>
            <span class="parent-access-chip">${room.accessCode}</span>
        </li>
    `).join('');
}

function openChat(userType) {
    if (userType === 'teacher') {
        showPage('teacher-messages');
        loadConversations();
    } else if (userType === 'parent') {
        alert('💬 Secure Messaging System\n\n' +
              'Your conversation with Sarah Martinez:\n\n' +
              '---\n' +
              'Sarah Martinez (Nov 1, 10:30 AM):\n' +
              '"Hi Jennifer! Emma did wonderfully today. She really enjoyed the Noah\'s Ark lesson and was very engaged during craft time."\n\n' +
              'You (Nov 1, 11:15 AM):\n' +
              '"Thank you so much! She was very excited to tell me about it when she got home."\n\n' +
              '---\n\n' +
              'Type your message below...\n' +
              '(Demo mode - Secure messaging simulated)');
    } else if (userType === 'admin') {
        if (!currentUser.loggedIn || currentUser.type !== 'admin') {
            showToast('Admin login required to view global messages.', true);
            return;
        }
        showToast('Global messaging coming soon. Stay tuned!');
    }
}

// Load and render conversations list
function loadConversations() {
    const list = document.getElementById('conversations-list');
    if (!list) return;
    
    // Sort by most recent
    const sorted = [...CONVERSATIONS].sort((a, b) => 
        b.lastMessageTime - a.lastMessageTime
    );
    
    list.innerHTML = sorted.map(conv => `
        <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" 
             onclick="openConversation(${conv.id})">
            <div class="conversation-avatar">
                ${conv.parentName.split(' ').map(n => n[0]).join('')}
            </div>
            <div class="conversation-info">
                <div class="conversation-header-row">
                    <h4>${conv.parentName}</h4>
                    <span class="conversation-time">${formatMessageTime(conv.lastMessageTime)}</span>
                </div>
                <p class="conversation-child">${conv.childName}</p>
                <p class="conversation-preview ${conv.unread > 0 ? 'unread' : ''}">
                    ${conv.lastMessage}
                </p>
            </div>
            ${conv.unread > 0 ? `<div class="unread-badge">${conv.unread}</div>` : ''}
        </div>
    `).join('');
}

// Filter conversations by search
function filterConversations() {
    const searchTerm = document.getElementById('conversation-search').value.toLowerCase();
    const items = document.querySelectorAll('.conversation-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Open a specific conversation
function openConversation(conversationId) {
    currentConversationId = conversationId;
    const conversation = CONVERSATIONS.find(c => c.id === conversationId);
    
    if (!conversation) return;
    
    // Mark messages as read
    conversation.messages.forEach(msg => msg.read = true);
    conversation.unread = 0;
    
    // Update UI
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('message-thread-container').style.display = 'flex';
    
    // Update header
    document.getElementById('thread-parent-name').textContent = conversation.parentName;
    document.getElementById('thread-child-info').textContent = 
        `Parent of ${conversation.childName} (${conversation.childClass})`;
    
    // Load messages
    loadMessages(conversationId);
    
    // Update conversation list to show active state
    loadConversations();
    
    // Focus message input
    document.getElementById('message-input').focus();
}

// Load messages for current conversation
function loadMessages(conversationId) {
    const conversation = CONVERSATIONS.find(c => c.id === conversationId);
    if (!conversation) return;
    
    const messagesArea = document.getElementById('messages-area');
    
    messagesArea.innerHTML = conversation.messages.map(msg => `
        <div class="message ${msg.sender === 'teacher' ? 'message-sent' : 'message-received'}">
            <div class="message-content">
                <p>${msg.text}</p>
                <div class="message-meta">
                    <span class="message-time">${formatMessageTime(msg.timestamp)}</span>
                    ${msg.sender === 'teacher' && msg.read ? 
                        '<span class="message-status">✓ Read</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !currentConversationId) return;
    
    const conversation = CONVERSATIONS.find(c => c.id === currentConversationId);
    if (!conversation) return;
    
    const newMessage = {
        id: conversation.messages.length + 1,
        sender: 'teacher',
        text: messageText,
        timestamp: new Date(),
        read: false
    };
    
    conversation.messages.push(newMessage);
    conversation.lastMessage = messageText;
    conversation.lastMessageTime = newMessage.timestamp;
    
    input.value = '';
    
    loadMessages(currentConversationId);
    loadConversations();
    
    showToast('Message sent successfully!');
    
    setTimeout(() => {
        newMessage.read = true;
        if (currentConversationId === conversation.id) {
            loadMessages(currentConversationId);
        }
    }, 3000);
}

// Handle Enter key in message input
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('message-form').dispatchEvent(new Event('submit'));
            }
        });
    }
});

// Close current thread
function closeThread() {
    currentConversationId = null;
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('message-thread-container').style.display = 'none';
    loadConversations();
}

// Start new conversation
function startNewConversation() {
    const modal = document.getElementById('new-conversation-modal');
    modal.style.display = 'flex';
    
    // Populate parent select
    const select = document.getElementById('select-parent');
    
    // Get parents who don't have existing conversations
    const existingParentIds = CONVERSATIONS.map(c => c.parentId);
    const availableParents = CLASS_PARENTS.filter(p => !existingParentIds.includes(p.id));
    
    select.innerHTML = '<option value="">Choose a parent...</option>' + 
        availableParents.map(parent => 
            `<option value="${parent.id}">${parent.name} (${parent.childName})</option>`
        ).join('');
    
    // Focus on select
    setTimeout(() => select.focus(), 100);
}

// Close new conversation modal
function closeNewConversationModal() {
    const modal = document.getElementById('new-conversation-modal');
    modal.style.display = 'none';
    document.getElementById('new-conversation-form').reset();
}

// Create new conversation
function createNewConversation(event) {
    event.preventDefault();
    
    const parentId = parseInt(document.getElementById('select-parent').value);
    const messageText = document.getElementById('initial-message').value.trim();
    
    if (!parentId || !messageText) return;
    
    const parent = CLASS_PARENTS.find(p => p.id === parentId);
    if (!parent) return;
    
    // Create new conversation
    const newConversation = {
        id: CONVERSATIONS.length + 1,
        parentId: parent.id,
        parentName: parent.name,
        childName: parent.childName,
        childClass: 'Pre-K Room A',
        lastMessage: messageText,
        lastMessageTime: new Date(),
        unread: 0,
        messages: [
            {
                id: 1,
                sender: 'teacher',
                text: messageText,
                timestamp: new Date(),
                read: false
            }
        ]
    };
    
    CONVERSATIONS.push(newConversation);
    
    // Close modal
    closeNewConversationModal();
    
    // Open the new conversation
    openConversation(newConversation.id);
    
    // Show success message
    showMessageToast('Message sent successfully!');
}

// Format timestamp for display
function formatMessageTime(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        // Today - show time
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Show toast notification
function showMessageToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'message-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('new-conversation-modal');
    if (event.target === modal) {
        closeNewConversationModal();
    }
});

// --- PARENT PORTAL API CONTROLLER ---

/**
 * Parent Portal UI States Manager
 * Handles loading, error, and success states for parent dashboard
 */
const ParentPortalController = {

    // UI State trackers
    uiState: {
        isLoading: false,
        error: null,
        activeRequest: null
    },

    getOverlay(container, createIfMissing = true) {
        if (!container) return null;

        let overlay = container.querySelector('.parent-panel-overlay');
        if (!overlay && createIfMissing) {
            overlay = document.createElement('div');
            overlay.className = 'parent-panel-overlay';
            overlay.setAttribute('hidden', '');
            container.prepend(overlay);
        }

        return overlay;
    },

    hideOverlay(container) {
        const overlay = this.getOverlay(container, false);
        if (!overlay) return;

        overlay.innerHTML = '';
        overlay.hidden = true;
        container.classList.remove('state-loading', 'state-error');
        this.uiState.isLoading = false;
        this.uiState.error = null;
    },

    /**
     * Show loading state UI overlay
     * @param {HTMLElement} container - Target container for loading state
     * @param {string} message - Optional loading message
     */
    showLoadingState(container, message = 'Loading...') {
        if (!container) return;

        const overlay = this.getOverlay(container);
        if (!overlay) return;

        const loadingHTML = `
            <div class="parent-loading-state" role="status" aria-busy="true">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;

        overlay.innerHTML = loadingHTML;
        overlay.hidden = false;
        container.classList.add('state-loading');
        container.classList.remove('state-error');
        this.uiState.isLoading = true;
    },

    /**
     * Show error state UI with retry option
const ParentPortalController = {

    // UI State trackers
    uiState: {
        isLoading: false,
        error: null,
        activeRequest: null
    },

    getOverlay(container, createIfMissing = true) {
        if (!container) return null;

        let overlay = container.querySelector('.parent-panel-overlay');
        if (!overlay && createIfMissing) {
            overlay = document.createElement('div');
            overlay.className = 'parent-panel-overlay';
            overlay.setAttribute('hidden', '');
            container.prepend(overlay);
        }

        return overlay;
    },

    hideOverlay(container) {
        const overlay = this.getOverlay(container, false);
        if (!overlay) return;

        overlay.innerHTML = '';
        overlay.hidden = true;
        container.classList.remove('state-loading', 'state-error');
        this.uiState.isLoading = false;
        this.uiState.error = null;
    },

    /**
     * Show loading state UI overlay
     * @param {HTMLElement} container - Target container for loading state
     * @param {string} message - Optional loading message
     */
    showLoadingState(container, message = 'Loading...') {
        if (!container) return;

        const overlay = this.getOverlay(container);
        if (!overlay) return;

        const loadingHTML = `
            <div class="parent-loading-state" role="status" aria-busy="true">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;

        overlay.innerHTML = loadingHTML;
        overlay.hidden = false;
        container.classList.add('state-loading');
        container.classList.remove('state-error');
        this.uiState.isLoading = true;
    },

    /**
     * Show error state UI with retry option
     * @param {HTMLElement} container - Target container for error state
     * @param {string} title - Error title
     * @param {string} message - Error description
     * @param {Function} onRetry - Callback for retry button
     */
    showErrorState(container, title = 'Error', message = 'Something went wrong', onRetry = null) {
        if (!container) return;

        const overlay = this.getOverlay(container);
        if (!overlay) return;

        const retryButton = onRetry
            ? '<button type="button" class="btn btn-secondary" data-parent-overlay-retry>Retry</button>'
            : '';

        const errorHTML = `
            <div class="parent-error-state" role="alert">
                <div class="error-icon">⚠️</div>
                <h4>${title}</h4>
                <p>${message}</p>
                <div class="error-actions">
                    ${retryButton}
                    <button type="button" class="btn btn-secondary" data-parent-overlay-close>Close</button>
                </div>
            </div>
        `;

        overlay.innerHTML = errorHTML;
        overlay.hidden = false;
        container.classList.add('state-error');
        container.classList.remove('state-loading');
        this.uiState.isLoading = false;
        this.uiState.error = message;

        // Attach retry handler if provided
        if (onRetry) {
            const retryBtn = overlay.querySelector('[data-parent-overlay-retry]');
            if (retryBtn) {
                retryBtn.addEventListener('click', event => {
                    event.preventDefault();
                    onRetry();
                });
            }
        }

        const closeBtn = overlay.querySelector('[data-parent-overlay-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', event => {
                event.preventDefault();
                this.showDefaultState();
            });
        }
    },

    /**
     * Clear loading/error state and show default empty state
     */
    showDefaultState() {
        const wrapper = document.getElementById('parent-panel-wrapper');
        if (!wrapper) return;

        this.hideOverlay(wrapper);
        resetParentPanel();
    },
        if (!container) return;

        const overlay = this.getOverlay(container);
        if (!overlay) return;

        const retryButton = onRetry
            ? '<button type="button" class="btn btn-secondary" data-parent-overlay-retry>Retry</button>'
            : '';

        const errorHTML = `
            <div class="parent-error-state" role="alert">
                <div class="error-icon">⚠️</div>
                <h4>${title}</h4>
                <p>${message}</p>
                <div class="error-actions">
                    ${retryButton}
                    <button type="button" class="btn btn-secondary" data-parent-overlay-close>Close</button>
                </div>
            </div>
        `;

        overlay.innerHTML = errorHTML;
        overlay.hidden = false;
        container.classList.add('state-error');
        container.classList.remove('state-loading');
        this.uiState.isLoading = false;
        this.uiState.error = message;

        // Attach retry handler if provided
        if (onRetry) {
            const retryBtn = overlay.querySelector('[data-parent-overlay-retry]');
            if (retryBtn) {
                retryBtn.addEventListener('click', event => {
                    event.preventDefault();
                    onRetry();
                });
            }
        }

        const closeBtn = overlay.querySelector('[data-parent-overlay-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', event => {
                event.preventDefault();
                this.showDefaultState();
            });
        }
    },

    /**
     * Clear loading/error state and show default empty state
     */
    showDefaultState() {
        const wrapper = document.getElementById('parent-panel-wrapper');
        if (!wrapper) return;

        this.hideOverlay(wrapper);
        resetParentPanel();
    },

    /**
     * Fetch parent dashboard data from GET /parent/dashboard
     * @returns {Promise<Object>} Dashboard data
     */
    async fetchParentDashboard(statusMessage = 'Loading your dashboard...') {
        if (this.uiState.activeRequest) {
            return this.uiState.activeRequest;
        }

        const wrapper = document.getElementById('parent-panel-wrapper');
        if (wrapper) {
            this.showLoadingState(wrapper, statusMessage);
        }

        const requestPromise = (async () => {
            try {
                const response = await this.mockApiCall(
                    '/parent/dashboard',
                    'GET',
                    { childId: currentUser.data?.id || 'child-001' }
                );

                if (!response.ok) {
                    throw new Error(response.error || 'Failed to load dashboard');
                }

                if (wrapper) {
                    this.hideOverlay(wrapper);
                }

                return response.data;
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                if (wrapper) {
                    this.showErrorState(
                        wrapper,
                        'Dashboard Unavailable',
                        error.message || 'Failed to load your dashboard. Please try again.',
                        () => this.fetchParentDashboard(statusMessage)
                    );
                }
                throw error;
            } finally {
                this.uiState.activeRequest = null;
            }
        })();

        this.uiState.activeRequest = requestPromise;
        return requestPromise;
    },
    async fetchParentDashboard(statusMessage = 'Loading your dashboard...') {
        if (this.uiState.activeRequest) {
            return this.uiState.activeRequest;
        }

        const wrapper = document.getElementById('parent-panel-wrapper');
        if (wrapper) {
            this.showLoadingState(wrapper, statusMessage);
        }

        const requestPromise = (async () => {
            try {
                const response = await this.mockApiCall(
                    '/parent/dashboard',
                    'GET',
                    { childId: currentUser.data?.id || 'child-001' }
                );

                if (!response.ok) {
                    throw new Error(response.error || 'Failed to load dashboard');
                }

                if (wrapper) {
                    this.hideOverlay(wrapper);
                }

                return response.data;
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                if (wrapper) {
                    this.showErrorState(
                        wrapper,
                        'Dashboard Unavailable',
                        error.message || 'Failed to load your dashboard. Please try again.',
                        () => this.fetchParentDashboard(statusMessage)
                    );
                }
                throw error;
            } finally {
                this.uiState.activeRequest = null;
            }
        })();

        this.uiState.activeRequest = requestPromise;
        return requestPromise;
    },
    async fetchParentDashboard() {
        const wrapper = document.getElementById('parent-panel-wrapper');
        this.showLoadingState(wrapper, 'Loading your dashboard...');

        try {
            // Simulate API call to GET /parent/dashboard
            const response = await this.mockApiCall(
                '/parent/dashboard',
                'GET',
                { childId: currentUser.data?.id || 'child-001' }
            );

            if (!response.ok) {
                throw new Error(response.error || 'Failed to load dashboard');
            }

            this.hideOverlay(wrapper);
            return response.data;
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            this.showErrorState(
                wrapper,
                'Dashboard Unavailable',
                error.message || 'Failed to load your dashboard. Please try again.',
                () => this.fetchParentDashboard()
            );
            throw error;
        }
    },

    /**
     * Send parent message via POST /parent/message
     * @param {string} messageText - Message content
     * @param {string} recipientId - Teacher/recipient ID
     * @returns {Promise<Object>} Send confirmation
     */
    async sendParentMessage(messageText, recipientId = 'teacher-001') {
        if (!messageText || !messageText.trim()) {
            showMessageToast('Please type a message');
            return null;
        }

        const form = document.getElementById('parent-chat-form');
        const input = document.getElementById('parent-chat-input');
        const submitBtn = form?.querySelector('button[type="submit"]');

        try {
            // Disable form during submission
            if (submitBtn) submitBtn.disabled = true;
            if (input) input.disabled = true;

            // Simulate API call to POST /parent/message
            const response = await this.mockApiCall(
                '/parent/message',
                'POST',
                {
                    parentId: currentUser.data?.id || 'parent-001',
                    recipientId: recipientId,
                    message: messageText.trim(),
                    timestamp: new Date().toISOString()
                }
            );

            if (!response.ok) {
                throw new Error(response.error || 'Failed to send message');
            }

            // Clear input and show success
            if (input) input.value = '';
            showMessageToast('Message sent successfully!');

            const apiMessage = response.data;
            const newMessage = {
                id: apiMessage.id,
                sender: 'You',
                timestamp: formatParentChatTimestamp(apiMessage.timestamp),
                message: apiMessage.message
            };

            PARENT_CHAT_MESSAGES.push(newMessage);

            if (parentDashboardData) {
                const updatedMessages = [...(parentDashboardData.messages || []), newMessage];
                const updatedDashboard = normalizeParentDashboardData({
                    ...parentDashboardData,
                    messages: updatedMessages
                });
                updateParentDashboardUI(updatedDashboard);
            }

            return apiMessage;

        } catch (error) {
            console.error('Message send error:', error);
            showMessageToast('Failed to send message. Please try again.');
            throw error;
            if (input) input.value = '';
            showMessageToast('Message sent successfully!');

            const apiMessage = response.data;
            const newMessage = {
                id: apiMessage.id,
                sender: 'You',
                timestamp: formatParentChatTimestamp(apiMessage.timestamp),
                message: apiMessage.message
            };

            PARENT_CHAT_MESSAGES.push(newMessage);

            if (parentDashboardData) {
                const updatedMessages = [...(parentDashboardData.messages || []), newMessage];
                const updatedDashboard = normalizeParentDashboardData({
                    ...parentDashboardData,
                    messages: updatedMessages
                });
                updateParentDashboardUI(updatedDashboard);
            }

            return apiMessage;

        } catch (error) {
            console.error('Message send error:', error);
            showMessageToast('Failed to send message. Please try again.');
            throw error;
        } finally {
            // Re-enable form
            if (submitBtn) submitBtn.disabled = false;
            if (input) input.disabled = false;
        }
    },

    /**
     * Mock API call handler (simulates backend endpoints)
     * In production, replace with actual fetch() calls
     * 
     * @param {string} endpoint - API endpoint path
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {Object} data - Request payload or query params
     * @returns {Promise<Object>} API response
     */
    async mockApiCall(endpoint, method = 'GET', data = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simulate API responses based on endpoint
        if (endpoint === '/parent/dashboard' && method === 'GET') {
            return {
                ok: true,
                data: {
                    childId: data.childId,
                    childName: currentUser.data?.child?.name || 'Emma Smith',
                    className: currentUser.data?.child?.class || 'Pre-K Room A',
                    teacher: currentUser.data?.child?.teacher || 'Sarah Martinez',
                    lastUpdated: new Date().toISOString(),
                    attendance: PARENT_ATTENDANCE,
                    events: PARENT_EVENTS,
                    gallery: PARENT_GALLERY_ITEMS,
                    messages: PARENT_CHAT_MESSAGES,
                    followup: PARENT_FOLLOWUP,
                    reports: {
                        attendance: '92%',
                        memoryVerse: 'In Progress',
                        nextStep: 'Encourage Emma to bring a friend to Fall Festival'
                    }
                    attendance: PARENT_ATTENDANCE,
                    events: PARENT_EVENTS,
                    gallery: PARENT_GALLERY_ITEMS,
                    messages: PARENT_CHAT_MESSAGES,
                    followup: PARENT_FOLLOWUP,
                    reports: {
                        attendance: '92%',
                        memoryVerse: 'In Progress',
                        nextStep: 'Encourage Emma to bring a friend to Fall Festival'
                    }
                }
            };
        }

        if (endpoint === '/parent/message' && method === 'POST') {
            // Validate message content
            if (!data.message || data.message.length === 0) {
                return {
                    ok: false,
                    error: 'Message cannot be empty'
                };
            }

            if (data.message.length > 5000) {
                return {
                    ok: false,
                    error: 'Message exceeds 5000 character limit'
                };
            }

            return {
                ok: true,
                data: {
                    id: Date.now(),
                    parentId: data.parentId,
                    recipientId: data.recipientId,
                    message: data.message,
                    timestamp: data.timestamp,
                    status: 'sent',
                    read: false
                }
            };
        }

        // Default error for unknown endpoints
        return {
            ok: false,
            error: `Unknown endpoint: ${endpoint}`
        };
    }
};

async function ensureParentDashboardData({ forceRefresh = false, statusMessage = 'Loading your dashboard...' } = {}) {
    if (!currentUser.loggedIn || currentUser.type !== 'parent') {
        return null;
    }

    if (parentDashboardData && !forceRefresh) {
        return parentDashboardData;
    }

    const dashboardData = await ParentPortalController.fetchParentDashboard(statusMessage);
    const normalized = normalizeParentDashboardData(dashboardData);
    updateParentDashboardUI(normalized);
    return parentDashboardData;
}

/**
 * Update parent view with fetched dashboard data
 * Called after successful login and data fetch
 */
async function updateParentViewAfterLogin() {
    if (!currentUser.loggedIn || currentUser.type !== 'parent') {
        console.warn('Not logged in as parent');
        return;
    }

    try {
        await ensureParentDashboardData({
            forceRefresh: true,
            statusMessage: 'Preparing your family dashboard...'
        });

        // Show success feedback
        showMessageToast('Welcome back! Dashboard updated.');
    } catch (error) {
        console.error('Failed to update parent view:', error);
        // Error state is already shown by fetchParentDashboard()
    }
}
async function ensureParentDashboardData({ forceRefresh = false, statusMessage = 'Loading your dashboard...' } = {}) {
    if (!currentUser.loggedIn || currentUser.type !== 'parent') {
        return null;
    }

    if (parentDashboardData && !forceRefresh) {
        return parentDashboardData;
    }

    const dashboardData = await ParentPortalController.fetchParentDashboard(statusMessage);
    const normalized = normalizeParentDashboardData(dashboardData);
    updateParentDashboardUI(normalized);
    return parentDashboardData;
}

/**
 * Update parent view with fetched dashboard data
 * Called after successful login and data fetch
 */
async function updateParentViewAfterLogin() {
    if (!currentUser.loggedIn || currentUser.type !== 'parent') {
        console.warn('Not logged in as parent');
        return;
    }

    try {
        await ensureParentDashboardData({
            forceRefresh: true,
            statusMessage: 'Preparing your family dashboard...'
        });

        // Show success feedback
        showMessageToast('Welcome back! Dashboard updated.');
    } catch (error) {
        console.error('Failed to update parent view:', error);
        // Error state is already shown by fetchParentDashboard()
    }
}

/**
 * Update parent dashboard UI with fresh data
 * @param {Object} dashboardData - Data from /parent/dashboard endpoint
 */
function updateParentDashboardUI(dashboardData) {
    if (!dashboardData) return;

    parentDashboardData = dashboardData;

    const childNameEl = document.querySelector('[data-dashboard-child-name]');
    const classNameEl = document.querySelector('[data-dashboard-class-name]');
    const teacherNameEl = document.querySelector('[data-dashboard-teacher-name]');

    if (childNameEl) childNameEl.textContent = dashboardData.childName;
    if (classNameEl) classNameEl.textContent = dashboardData.className;
    if (teacherNameEl) teacherNameEl.textContent = dashboardData.teacher;

    const galleryButton = document.querySelector('.parent-panel-trigger[data-panel="gallery"]');
    if (galleryButton) {
        const galleryCount = dashboardData.gallery?.length || 0;
        const label = galleryCount === 1 ? '1 photo' : `${galleryCount} photos`;
        galleryButton.textContent = galleryCount ? `View Gallery (${label})` : 'View Gallery';
    }

    const chatButton = document.querySelector('.parent-panel-trigger[data-panel="chat"]');
    if (chatButton) {
        const messageCount = dashboardData.messages?.length || 0;
        chatButton.textContent = messageCount ? `Open Messages (${messageCount})` : 'Start Chat';
    }

    const eventsButton = document.querySelector('.parent-panel-trigger[data-panel="events"]');
    if (eventsButton) {
        const eventCount = dashboardData.events?.length || 0;
        eventsButton.textContent = eventCount ? `View Events (${eventCount})` : 'View Events';
    }

    const reportsButton = document.querySelector('.parent-panel-trigger[data-panel="reports"]');
    if (reportsButton) {
        const attendanceRate = dashboardData.reports?.attendance;
        reportsButton.textContent = attendanceRate
            ? `View Reports (${attendanceRate})`
            : 'View Reports';
    }

    const loginAnnouncement = document.getElementById('parent-login-announcement');
    if (loginAnnouncement) {
        loginAnnouncement.textContent = formatParentLoginAnnouncement();
    }

    if (parentPanelState.activePanel !== 'default') {
        renderActiveParentPanel();
    }

    initializeParentDashboardControls();

    console.log('Parent dashboard updated with fresh data:', dashboardData);
}

// --- MARKETPLACE, CART, AND ORDER SUPPORT ---

const PRODUCT_CATEGORIES = [
    { id: 'all', name: 'All Resources', icon: '🛒' },
    { id: 'lesson-kits', name: 'Lesson Kits', icon: '🎒' },
    { id: 'family-devotions', name: 'Family Devotions', icon: '🏡' },
    { id: 'worship', name: 'Worship & Music', icon: '🎵' },
    { id: 'crafts', name: 'Creative Crafts', icon: '🎨' },
    { id: 'seasonal', name: 'Seasonal Specials', icon: '✨' }
];

const PRODUCT_CATALOG = [
    {
        id: 'advent-story-kit',
        name: 'Advent Storytelling Kit',
        category: 'seasonal',
        price: 34.0,
        rank: 1,
        description: 'Includes 4 weeks of family devotions, ornament crafts, and candle lighting prompts.',
        summary: 'Four-week family journey with printable ornaments.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Family reading an advent story together'
    },
    {
        id: 'faith-family-box',
        name: 'Faith at Home Family Box',
        category: 'family-devotions',
        price: 48.0,
        rank: 2,
        description: 'Monthly box with table talk cards, scripture posters, and faith-building games.',
        summary: 'Keeps discipleship simple for busy families.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Family gathered around the table with crafts'
    },
    {
        id: 'praise-card-pack',
        name: 'Kids Praise Card Pack',
        category: 'worship',
        price: 12.5,
        rank: 3,
        description: '20 illustrated cards with motion cues and memory verses for worship time.',
        summary: 'Perfect for small group worship warm-ups.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Child singing with colorful cards'
    },
    {
        id: 'craft-celebration-bundle',
        name: 'Celebration Craft Bundle',
        category: 'crafts',
        price: 27.0,
        rank: 4,
        description: 'Bulk pack of 10 themed crafts with templates and supply lists for class use.',
        summary: 'Ready-to-go crafts for your entire classroom.',
        image: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Children cutting paper crafts at a table'
    },
    {
        id: 'memory-verse-poster-set',
        name: 'Memory Verse Poster Set',
        category: 'lesson-kits',
        price: 22.0,
        rank: 5,
        description: 'Set of 12 laminated posters with monthly themes and discussion prompts.',
        summary: 'Bright visuals for classrooms and hallways.',
        image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Colorful posters on a classroom wall'
    },
    {
        id: 'worship-playlist-bundle',
        name: 'Worship Playlist + Motions Bundle',
        category: 'worship',
        price: 18.0,
        rank: 6,
        description: 'Downloadable MP3s, lyric slides, and motion tutorial videos for 8 upbeat songs.',
        summary: 'Instant energy for large group sessions.',
        image: 'https://images.unsplash.com/photo-1484976063837-eab657a7d0f5?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Kids dancing with music in a classroom'
    },
    {
        id: 'weekend-lesson-kit',
        name: 'Weekend Lesson Kit: Acts & Adventure',
        category: 'lesson-kits',
        price: 39.0,
        rank: 7,
        description: 'Complete weekend plan with scripts, slides, small group guides, and parent handouts.',
        summary: 'One download covers large group and small group.',
        image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Teacher reading a Bible story to children'
    },
    {
        id: 'milestone-celebration-set',
        name: 'Milestone Celebration Set',
        category: 'seasonal',
        price: 42.0,
        rank: 8,
        description: 'Baptism and child dedication celebration guide with certificates, banners, and gifts.',
        summary: 'Helps families mark spiritual milestones together.',
        image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Celebration table with cupcakes and decorations'
    },
    {
        id: 'leader-starter-pack',
        name: 'Small Group Leader Starter Pack',
        category: 'family-devotions',
        price: 69.0,
        rank: 9,
        description: 'Training workbook, coaching videos, and first-month supplies for new volunteers.',
        summary: 'Everything new leaders need for confident starts.',
        image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Volunteers planning with notebooks and coffee'
    }
];

let cartItems = [];
let activeProductCategory = 'all';
let pendingOrderRecord = null;
let lastCompletedOrder = null;

let ORDER_HISTORY = [
    {
        id: 'BCC-24001',
        name: 'Jennifer Smith',
        email: 'parent@demo.com',
        status: 'Out for Delivery',
        placedOn: '2025-10-02T14:30:00Z',
        estimatedDelivery: '2025-10-10T16:00:00Z',
        total: 73.0,
        items: [
            { name: 'Faith at Home Family Box', quantity: 1, price: 48.0 },
            { name: 'Kids Praise Card Pack', quantity: 2, price: 12.5 }
        ],
        statusHistory: [
            { label: 'Out for delivery', timestamp: '2025-10-09T14:20:00Z' },
            { label: 'Departed fulfillment center', timestamp: '2025-10-08T09:00:00Z' },
            { label: 'Payment received', timestamp: '2025-10-02T14:35:00Z' },
            { label: 'Order confirmed', timestamp: '2025-10-02T14:31:00Z' },
            { label: 'Order placed', timestamp: '2025-10-02T14:30:00Z' }
        ]
    },
    {
        id: 'BCC-24018',
        name: 'Michael Johnson',
        email: 'teacher@demo.com',
        status: 'Processing',
        placedOn: '2025-10-05T18:05:00Z',
        estimatedDelivery: '2025-10-12T20:00:00Z',
        total: 123.0,
        items: [
            { name: 'Weekend Lesson Kit: Acts & Adventure', quantity: 2, price: 39.0 },
            { name: 'Celebration Craft Bundle', quantity: 1, price: 27.0 },
            { name: 'Worship Playlist + Motions Bundle', quantity: 1, price: 18.0 }
        ],
        statusHistory: [
            { label: 'Preparing for shipment', timestamp: '2025-10-06T09:10:00Z' },
            { label: 'Payment received', timestamp: '2025-10-05T18:06:00Z' },
            { label: 'Order confirmed', timestamp: '2025-10-05T18:05:30Z' }
        ]
    }
];

function initializeMarketplace() {
    if (!document.getElementById('product-grid')) {
        return;
    }

    renderProductCategories();
    filterProducts();
    renderCart();
    updateCartCount();
}

function renderProductCategories() {
    const container = document.getElementById('product-category-buttons');
    if (!container) return;

    const buttonsHtml = PRODUCT_CATEGORIES.map(category => {
        const isActive = category.id === activeProductCategory;
        return `<button type="button" class="${isActive ? 'active' : ''}" data-category="${category.id}">${category.icon} ${category.name}</button>`;
    }).join('');

    container.innerHTML = buttonsHtml;

    container.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            activeProductCategory = button.dataset.category || 'all';
            renderProductCategories();
            filterProducts();
        });
    });
}

function getCategoryName(categoryId) {
    return PRODUCT_CATEGORIES.find(category => category.id === categoryId)?.name || 'Resource';
}

function getCategoryIcon(categoryId) {
    return PRODUCT_CATEGORIES.find(category => category.id === categoryId)?.icon || '🛍️';
}

function renderProductCatalog() {
    filterProducts();
}

function filterProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const searchTerm = (document.getElementById('product-search')?.value || '').trim().toLowerCase();
    const sortValue = document.getElementById('product-sort')?.value || 'featured';

    let filteredProducts = PRODUCT_CATALOG.filter(product => {
        const matchesCategory = activeProductCategory === 'all' || product.category === activeProductCategory;
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    if (sortValue === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else {
        filteredProducts.sort((a, b) => a.rank - b.rank);
    }

    if (!filteredProducts.length) {
        grid.innerHTML = '<div class="empty-state">No products match your filters yet. Try another search or category.</div>';
        return;
    }

    const html = filteredProducts.map(product => `
        <article class="product-card">
            <img src="${product.image}" alt="${product.imageAlt || product.name}" loading="lazy">
            <div class="product-card-body">
                <span class="product-category">${getCategoryIcon(product.category)} ${getCategoryName(product.category)}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-card-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button type="button" class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `).join('');

    grid.innerHTML = html;

    grid.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.currentTarget.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
}

function getProductById(productId) {
    return PRODUCT_CATALOG.find(product => product.id === productId) || null;
}

function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({ productId, quantity: 1 });
    }

    renderCart();
    updateCartCount();
    resetOrderConfirmationMessage();
    hidePaymentPanel();
    showToast(`${product.name} added to your cart.`);
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.productId !== productId);
    renderCart();
    updateCartCount();
    resetOrderConfirmationMessage();
    hidePaymentPanel();
}

function updateCartQuantity(productId, quantity) {
    const cartItem = cartItems.find(item => item.productId === productId);
    if (!cartItem) return;

    cartItem.quantity = quantity;

    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCart();
        updateCartCount();
    }
    resetOrderConfirmationMessage();
    hidePaymentPanel();
}

function resetOrderConfirmationMessage() {
    const message = document.getElementById('order-confirmation-message');
    if (message) {
        message.textContent = '';
        message.classList.remove('error');
    }
}

function renderCart() {
    const list = document.getElementById('cart-item-list');
    const emptyState = document.getElementById('cart-empty');
    if (!list || !emptyState) return;

    if (!cartItems.length) {
        list.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        list.innerHTML = cartItems.map(item => {
            const product = getProductById(item.productId);
            if (!product) return '';
            return `
                <li class="cart-item" data-product-id="${product.id}">
                    <img src="${product.image}" alt="${product.imageAlt || product.name}">
                    <div class="cart-item-details">
                        <h4>${product.name}</h4>
                        <p class="cart-item-meta">${product.summary}</p>
                        <div class="cart-item-controls">
                            <label class="sr-only" for="cart-qty-${product.id}">Quantity for ${product.name}</label>
                            <input type="number" id="cart-qty-${product.id}" class="cart-quantity-input" data-product-id="${product.id}" min="1" value="${item.quantity}">
                            <button type="button" class="btn btn-secondary cart-remove" data-product-id="${product.id}">Remove</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <span>${formatCurrency(product.price)} each</span>
                        <span>${formatCurrency(product.price * item.quantity)}</span>
                    </div>
                </li>
            `;
        }).join('');

        list.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', handleCartQuantityChange);
            input.addEventListener('input', handleCartQuantityChange);
        });

        list.querySelectorAll('.cart-remove').forEach(button => {
            button.addEventListener('click', event => {
                const productId = event.currentTarget.getAttribute('data-product-id');
                removeFromCart(productId);
            });
        });
    }

    renderCartSummary();
    updateConfirmButtonState();
}

function handleCartQuantityChange(event) {
    const input = event.currentTarget;
    const productId = input.getAttribute('data-product-id');
    if (!productId) return;

    const quantity = parseInt(input.value, 10);
    if (Number.isNaN(quantity) || quantity < 1) {
        input.value = '1';
        updateCartQuantity(productId, 1);
        return;
    }

    updateCartQuantity(productId, quantity);
}

function renderCartSummary() {
    const totals = calculateCartTotals();

    const itemsLabel = document.getElementById('cart-items-count');
    if (itemsLabel) {
        itemsLabel.textContent = totals.itemCount === 1 ? '1 item' : `${totals.itemCount} items`;
    }

    const subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);

    const taxEl = document.getElementById('cart-tax');
    if (taxEl) taxEl.textContent = formatCurrency(totals.tax);

    const shippingEl = document.getElementById('cart-shipping');
    if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping);

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = formatCurrency(totals.total);
}

function formatCurrency(amount) {
    const value = Number(amount) || 0;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateCartTotals() {
    const subtotal = cartItems.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const tax = subtotal * 0.07;
    const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 6.5;
    const total = subtotal + tax + shipping;

    return {
        subtotal,
        tax,
        shipping,
        total,
        itemCount
    };
}

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    if (itemCount > 0) {
        badge.hidden = false;
        badge.textContent = itemCount;
    } else {
        badge.hidden = true;
    }
}

function updateConfirmButtonState() {
    const confirmBtn = document.getElementById('cart-confirm');
    if (!confirmBtn) return;

    const emailInput = document.getElementById('checkout-email');
    const emailValue = emailInput?.value.trim() || '';
    const hasValidEmail = !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

    confirmBtn.disabled = cartItems.length === 0 || !hasValidEmail || !emailValue;
}

function handleCartRecalculate(event) {
    event.preventDefault();
    renderCartSummary();
    updateConfirmButtonState();
    showToast('Cart totals updated.');
}

function generateOrderId() {
    const dateSegment = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSegment = Math.floor(100 + Math.random() * 900);
    return `BCC-${dateSegment}-${randomSegment}`;
}

function showPaymentPanel(orderId, amount) {
    const panel = document.getElementById('payment-panel');
    if (!panel) return;

    panel.hidden = false;

    const orderIdField = document.getElementById('payment-order-id');
    if (orderIdField) orderIdField.textContent = orderId;

    const amountField = document.getElementById('payment-amount');
    if (amountField) amountField.textContent = formatCurrency(amount);

    const submitAmount = document.getElementById('payment-submit-amount');
    if (submitAmount) submitAmount.textContent = formatCurrency(amount);

    const feedback = document.getElementById('payment-feedback');
    if (feedback) feedback.textContent = '';

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) paymentForm.reset();
}

function hidePaymentPanel() {
    const panel = document.getElementById('payment-panel');
    if (panel) {
        panel.hidden = true;
    }
}

function handleOrderConfirm() {
    if (!cartItems.length) {
        showToast('Add items to your cart before confirming.', true);
        return;
    }

    const emailInput = document.getElementById('checkout-email');
    const nameInput = document.getElementById('checkout-name');
    const message = document.getElementById('order-confirmation-message');

    if (!emailInput || !message) return;

    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = 'Enter a valid email address so we can send your receipt and tracking updates.';
        message.classList.add('error');
        emailInput.focus();
        return;
    }

    const contactName = nameInput?.value.trim() || 'BCC Kids Family';
    const totals = calculateCartTotals();
    const orderId = generateOrderId();
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const orderItems = cartItems.map(item => {
        const product = getProductById(item.productId);
        return {
            productId: item.productId,
            name: product?.name || 'Resource',
            quantity: item.quantity,
            price: product?.price || 0
        };
    });

    pendingOrderRecord = {
        id: orderId,
        name: contactName,
        email,
        status: 'Awaiting Payment',
        placedOn: new Date().toISOString(),
        estimatedDelivery: estimatedDelivery.toISOString(),
        total: totals.total,
        items: orderItems,
        statusHistory: [
            { label: 'Awaiting payment', timestamp: new Date().toISOString() },
            { label: 'Order created', timestamp: new Date().toISOString() }
        ]
    };

    ORDER_HISTORY = [
        pendingOrderRecord,
        ...ORDER_HISTORY.filter(order => order.id !== pendingOrderRecord.id)
    ];

    message.textContent = `Order ${orderId} is reserved for ${formatCurrency(totals.total)}. Please complete payment below to finalize your shipment.`;
    message.classList.remove('error');

    showPaymentPanel(orderId, totals.total);
    showToast('Order confirmed! Complete payment to finish checkout.');
}

function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!pendingOrderRecord) {
        showToast('Confirm your order before submitting payment.', true);
        return;
    }

    const timestamp = new Date().toISOString();
    pendingOrderRecord.status = 'Payment received - preparing for shipment';
    pendingOrderRecord.statusHistory = [
        { label: 'Payment received', timestamp },
        ...pendingOrderRecord.statusHistory
    ];

    ORDER_HISTORY = ORDER_HISTORY.map(order =>
        order.id === pendingOrderRecord.id
            ? {
                ...pendingOrderRecord,
                items: pendingOrderRecord.items.map(item => ({ ...item })),
                statusHistory: pendingOrderRecord.statusHistory.map(entry => ({ ...entry }))
            }
            : order
    );

    const feedback = document.getElementById('payment-feedback');
    if (feedback) {
        feedback.textContent = `Payment received! A receipt will be sent to ${pendingOrderRecord.email}.`;
    }

    lastCompletedOrder = {
        ...pendingOrderRecord,
        items: pendingOrderRecord.items.map(item => ({ ...item })),
        statusHistory: pendingOrderRecord.statusHistory.map(entry => ({ ...entry }))
    };

    cartItems = [];
    renderCart();
    updateCartCount();
    updateConfirmButtonState();
    hidePaymentPanel();
    resetOrderConfirmationMessage();

    showToast('Payment processed successfully!');

    setTimeout(() => {
        showPage('order-status');
        if (lastCompletedOrder) {
            renderOrderStatusResult(lastCompletedOrder);
            const orderInput = document.getElementById('order-status-id');
            if (orderInput) {
                orderInput.value = lastCompletedOrder.id;
            }
            const emailInput = document.getElementById('order-status-email');
            if (emailInput) {
                emailInput.value = lastCompletedOrder.email;
            }
        }
    }, 900);

    pendingOrderRecord = null;
}

function handleOrderStatusLookup(event) {
    event.preventDefault();

    const orderIdInput = document.getElementById('order-status-id');
    const emailInput = document.getElementById('order-status-email');

    if (!orderIdInput) return;

    const orderId = orderIdInput.value.trim();
    const email = emailInput?.value.trim() || '';

    const order = findOrderRecord(orderId, email);
    renderOrderStatusResult(order);
}

function findOrderRecord(orderId, email) {
    if (!orderId) return null;

    const normalizedId = orderId.replace(/\s+/g, '').toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    return ORDER_HISTORY.find(order => {
        const matchesId = order.id.replace(/\s+/g, '').toUpperCase() === normalizedId;
        const matchesEmail = !normalizedEmail || order.email?.toLowerCase() === normalizedEmail;
        return matchesId && matchesEmail;
    }) || null;
}

function renderOrderStatusResult(order) {
    const container = document.getElementById('order-status-result');
    if (!container) return;

    if (!order) {
        container.innerHTML = `
            <div class="order-status-placeholder error">
                <h3>We couldn't find that order</h3>
                <p>Double-check your confirmation number and email, then try again or start a chat with our support team.</p>
            </div>
        `;
        return;
    }

    const itemsMarkup = (order.items || []).map(item => `
        <li>
            <span>${item.quantity} × ${item.name}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        </li>
    `).join('');

    const timelineMarkup = (order.statusHistory || []).map(entry => `
        <li>
            <span>${entry.label}</span>
            <time>${formatOrderTimestamp(entry.timestamp)}</time>
        </li>
    `).join('');

    container.innerHTML = `
        <div class="order-status-card">
            <h3>Order ${order.id}</h3>
            <p class="order-status-current"><strong>Status:</strong> ${order.status || 'Processing'}</p>
            <dl>
                <div><dt>Placed</dt><dd>${formatOrderDate(order.placedOn)}</dd></div>
                <div><dt>Contact</dt><dd>${order.name || '—'}</dd></div>
                <div><dt>Total</dt><dd>${formatCurrency(order.total)}</dd></div>
                <div><dt>Est. Delivery</dt><dd>${formatOrderDate(order.estimatedDelivery)}</dd></div>
            </dl>
            <h4>Items</h4>
            <ul class="order-item-list">${itemsMarkup}</ul>
            <h4>Recent Updates</h4>
            <ol class="order-status-timeline">${timelineMarkup}</ol>
        </div>
    `;
}

function formatOrderDate(value) {
    const date = parseOrderDate(value);
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatOrderTimestamp(value) {
    const date = parseOrderDate(value);
    if (!date) return '';
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function parseOrderDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatChatTimestamp(value) {
    const date = parseOrderDate(value);
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const CUSTOMER_CHAT_OPENERS = [
    'Hi there! 👋 I\'m Grace from the BCC Kids store. How can I help with your order today?',
    'Ask me about order status, curriculum bundles, or payment questions and I\'ll get you quick answers.'
];

let customerChatInitialized = false;
let customerChatTranscript = [];

function renderCustomerChat() {
    const chatWindow = document.getElementById('customer-chat-window');
    if (!chatWindow) return;

    if (!customerChatTranscript.length) {
        chatWindow.innerHTML = '<p class="chat-placeholder">Start a conversation and our team will jump in shortly.</p>';
        return;
    }

    chatWindow.innerHTML = customerChatTranscript.map(message => `
        <div class="chat-message ${message.sender === 'agent' ? 'agent' : 'customer'}">
            <p>${message.text}</p>
            <time>${formatChatTimestamp(message.timestamp)}</time>
        </div>
    `).join('');

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function initializeCustomerChat() {
    const chatWindow = document.getElementById('customer-chat-window');
    if (!chatWindow) return;

    if (!customerChatInitialized) {
        customerChatTranscript = CUSTOMER_CHAT_OPENERS.map(text => ({
            sender: 'agent',
            text,
            timestamp: new Date().toISOString()
        }));
        customerChatInitialized = true;
    }

    renderCustomerChat();
}

function appendCustomerChatMessage(sender, text) {
    customerChatTranscript.push({
        sender,
        text,
        timestamp: new Date().toISOString()
    });
    renderCustomerChat();
}

function handleCustomerChatSubmit(event) {
    event.preventDefault();

    const input = document.getElementById('customer-chat-input');
    if (!input) return;

    const messageText = input.value.trim();
    if (!messageText) return;

    appendCustomerChatMessage('customer', messageText);
    input.value = '';
    input.focus();

    setTimeout(() => {
        appendCustomerChatMessage('agent', getAutomatedChatReply(messageText));
    }, 650);
}

function getAutomatedChatReply(messageText) {
    const normalized = messageText.toLowerCase();

    if (normalized.includes('shipping') || normalized.includes('delivery')) {
        return 'Shipping update: orders leave our Indiana hub within 2 business days. You\'ll receive tracking via email as soon as a label is created.';
    }

    if (normalized.includes('status') || normalized.includes('order')) {
        return 'To check status quickly, enter your confirmation number on the Order Status tab. I can look it up for you if you share the number here too!';
    }

    if (normalized.includes('payment') || normalized.includes('card')) {
        return 'All payments are processed securely. We accept major cards and church purchase orders—just let us know if you need an invoice.';
    }

    if (normalized.includes('bulk') || normalized.includes('discount')) {
        return 'Great news—orders of 10 or more kits automatically receive tiered discounts in the cart. I can build a custom quote if you share quantities.';
    }

    return 'Thanks for reaching out! A team member will join the conversation shortly. Meanwhile, let me know your order number or question and we\'ll get it handled.';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMarketplace();

    const recalcBtn = document.getElementById('cart-recalculate');
    if (recalcBtn) {
        recalcBtn.addEventListener('click', handleCartRecalculate);
    }

    const confirmBtn = document.getElementById('cart-confirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleOrderConfirm);
    }

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    const orderStatusForm = document.getElementById('order-status-form');
    if (orderStatusForm) {
        orderStatusForm.addEventListener('submit', handleOrderStatusLookup);
    }

    const checkoutEmail = document.getElementById('checkout-email');
    if (checkoutEmail) {
        checkoutEmail.addEventListener('input', updateConfirmButtonState);
    }

    const chatForm = document.getElementById('customer-chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', handleCustomerChatSubmit);
    }
});

function handleParentChatSubmit() {
function updateParentDashboardUI(dashboardData) {
    if (!dashboardData) return;

    parentDashboardData = dashboardData;

    const childNameEl = document.querySelector('[data-dashboard-child-name]');
    const classNameEl = document.querySelector('[data-dashboard-class-name]');
    const teacherNameEl = document.querySelector('[data-dashboard-teacher-name]');

    if (childNameEl) childNameEl.textContent = dashboardData.childName;
    if (classNameEl) classNameEl.textContent = dashboardData.className;
    if (teacherNameEl) teacherNameEl.textContent = dashboardData.teacher;

    const galleryButton = document.querySelector('.parent-panel-trigger[data-panel="gallery"]');
    if (galleryButton) {
        const galleryCount = dashboardData.gallery?.length || 0;
        const label = galleryCount === 1 ? '1 photo' : `${galleryCount} photos`;
        galleryButton.textContent = galleryCount ? `View Gallery (${label})` : 'View Gallery';
    }

    const chatButton = document.querySelector('.parent-panel-trigger[data-panel="chat"]');
    if (chatButton) {
        const messageCount = dashboardData.messages?.length || 0;
        chatButton.textContent = messageCount ? `Open Messages (${messageCount})` : 'Start Chat';
    }

    const eventsButton = document.querySelector('.parent-panel-trigger[data-panel="events"]');
    if (eventsButton) {
        const eventCount = dashboardData.events?.length || 0;
        eventsButton.textContent = eventCount ? `View Events (${eventCount})` : 'View Events';
    }

    const reportsButton = document.querySelector('.parent-panel-trigger[data-panel="reports"]');
    if (reportsButton) {
        reportsButton.textContent = 'View Reports';
    }

    const loginAnnouncement = document.getElementById('parent-login-announcement');
    if (loginAnnouncement) {
        loginAnnouncement.textContent = formatParentLoginAnnouncement();
    }

    if (parentPanelState.activePanel !== 'default') {
        renderActiveParentPanel();
    }

    console.log('Parent dashboard updated with fresh data:', dashboardData);
}
function updateParentDashboardUI(dashboardData) {
    if (!dashboardData) return;

    const childNameEl = document.querySelector('[data-dashboard-child-name]');
    const classNameEl = document.querySelector('[data-dashboard-class-name]');
    const teacherNameEl = document.querySelector('[data-dashboard-teacher-name]');

    if (childNameEl) childNameEl.textContent = dashboardData.childName;
    if (classNameEl) classNameEl.textContent = dashboardData.className;
    if (teacherNameEl) teacherNameEl.textContent = dashboardData.teacher;

    const loginAnnouncement = document.getElementById('parent-login-announcement');
    if (loginAnnouncement) {
        loginAnnouncement.textContent = formatParentLoginAnnouncement();
    }

    console.log('Parent dashboard updated with fresh data:', dashboardData);
}

// --- MARKETPLACE, CART, AND ORDER SUPPORT ---

const PRODUCT_CATEGORIES = [
    { id: 'all', name: 'All Resources', icon: '🛒' },
    { id: 'lesson-kits', name: 'Lesson Kits', icon: '🎒' },
    { id: 'family-devotions', name: 'Family Devotions', icon: '🏡' },
    { id: 'worship', name: 'Worship & Music', icon: '🎵' },
    { id: 'crafts', name: 'Creative Crafts', icon: '🎨' },
    { id: 'seasonal', name: 'Seasonal Specials', icon: '✨' }
];

const PRODUCT_CATALOG = [
    {
        id: 'advent-story-kit',
        name: 'Advent Storytelling Kit',
        category: 'seasonal',
        price: 34.0,
        rank: 1,
        description: 'Includes 4 weeks of family devotions, ornament crafts, and candle lighting prompts.',
        summary: 'Four-week family journey with printable ornaments.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Family reading an advent story together'
    },
    {
        id: 'faith-family-box',
        name: 'Faith at Home Family Box',
        category: 'family-devotions',
        price: 48.0,
        rank: 2,
        description: 'Monthly box with table talk cards, scripture posters, and faith-building games.',
        summary: 'Keeps discipleship simple for busy families.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Family gathered around the table with crafts'
    },
    {
        id: 'praise-card-pack',
        name: 'Kids Praise Card Pack',
        category: 'worship',
        price: 12.5,
        rank: 3,
        description: '20 illustrated cards with motion cues and memory verses for worship time.',
        summary: 'Perfect for small group worship warm-ups.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Child singing with colorful cards'
    },
    {
        id: 'craft-celebration-bundle',
        name: 'Celebration Craft Bundle',
        category: 'crafts',
        price: 27.0,
        rank: 4,
        description: 'Bulk pack of 10 themed crafts with templates and supply lists for class use.',
        summary: 'Ready-to-go crafts for your entire classroom.',
        image: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Children cutting paper crafts at a table'
    },
    {
        id: 'memory-verse-poster-set',
        name: 'Memory Verse Poster Set',
        category: 'lesson-kits',
        price: 22.0,
        rank: 5,
        description: 'Set of 12 laminated posters with monthly themes and discussion prompts.',
        summary: 'Bright visuals for classrooms and hallways.',
        image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Colorful posters on a classroom wall'
    },
    {
        id: 'worship-playlist-bundle',
        name: 'Worship Playlist + Motions Bundle',
        category: 'worship',
        price: 18.0,
        rank: 6,
        description: 'Downloadable MP3s, lyric slides, and motion tutorial videos for 8 upbeat songs.',
        summary: 'Instant energy for large group sessions.',
        image: 'https://images.unsplash.com/photo-1484976063837-eab657a7d0f5?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Kids dancing with music in a classroom'
    },
    {
        id: 'weekend-lesson-kit',
        name: 'Weekend Lesson Kit: Acts & Adventure',
        category: 'lesson-kits',
        price: 39.0,
        rank: 7,
        description: 'Complete weekend plan with scripts, slides, small group guides, and parent handouts.',
        summary: 'One download covers large group and small group.',
        image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Teacher reading a Bible story to children'
    },
    {
        id: 'milestone-celebration-set',
        name: 'Milestone Celebration Set',
        category: 'seasonal',
        price: 42.0,
        rank: 8,
        description: 'Baptism and child dedication celebration guide with certificates, banners, and gifts.',
        summary: 'Helps families mark spiritual milestones together.',
        image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Celebration table with cupcakes and decorations'
    },
    {
        id: 'leader-starter-pack',
        name: 'Small Group Leader Starter Pack',
        category: 'family-devotions',
        price: 69.0,
        rank: 9,
        description: 'Training workbook, coaching videos, and first-month supplies for new volunteers.',
        summary: 'Everything new leaders need for confident starts.',
        image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Volunteers planning with notebooks and coffee'
    }
];

let cartItems = [];
let activeProductCategory = 'all';
let pendingOrderRecord = null;
let lastCompletedOrder = null;

let ORDER_HISTORY = [
    {
        id: 'BCC-24001',
        name: 'Jennifer Smith',
        email: 'parent@demo.com',
        status: 'Out for Delivery',
        placedOn: '2025-10-02T14:30:00Z',
        estimatedDelivery: '2025-10-10T16:00:00Z',
        total: 73.0,
        items: [
            { name: 'Faith at Home Family Box', quantity: 1, price: 48.0 },
            { name: 'Kids Praise Card Pack', quantity: 2, price: 12.5 }
        ],
        statusHistory: [
            { label: 'Out for delivery', timestamp: '2025-10-09T14:20:00Z' },
            { label: 'Departed fulfillment center', timestamp: '2025-10-08T09:00:00Z' },
            { label: 'Payment received', timestamp: '2025-10-02T14:35:00Z' },
            { label: 'Order confirmed', timestamp: '2025-10-02T14:31:00Z' },
            { label: 'Order placed', timestamp: '2025-10-02T14:30:00Z' }
        ]
    },
    {
        id: 'BCC-24018',
        name: 'Michael Johnson',
        email: 'teacher@demo.com',
        status: 'Processing',
        placedOn: '2025-10-05T18:05:00Z',
        estimatedDelivery: '2025-10-12T20:00:00Z',
        total: 123.0,
        items: [
            { name: 'Weekend Lesson Kit: Acts & Adventure', quantity: 2, price: 39.0 },
            { name: 'Celebration Craft Bundle', quantity: 1, price: 27.0 },
            { name: 'Worship Playlist + Motions Bundle', quantity: 1, price: 18.0 }
        ],
        statusHistory: [
            { label: 'Preparing for shipment', timestamp: '2025-10-06T09:10:00Z' },
            { label: 'Payment received', timestamp: '2025-10-05T18:06:00Z' },
            { label: 'Order confirmed', timestamp: '2025-10-05T18:05:30Z' }
        ]
    }
];

function initializeMarketplace() {
    if (!document.getElementById('product-grid')) {
        return;
    }

    renderProductCategories();
    filterProducts();
    renderCart();
    updateCartCount();
}

function renderProductCategories() {
    const container = document.getElementById('product-category-buttons');
    if (!container) return;

    const buttonsHtml = PRODUCT_CATEGORIES.map(category => {
        const isActive = category.id === activeProductCategory;
        return `<button type="button" class="${isActive ? 'active' : ''}" data-category="${category.id}">${category.icon} ${category.name}</button>`;
    }).join('');

    container.innerHTML = buttonsHtml;

    container.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            activeProductCategory = button.dataset.category || 'all';
            renderProductCategories();
            filterProducts();
        });
    });
}

function getCategoryName(categoryId) {
    return PRODUCT_CATEGORIES.find(category => category.id === categoryId)?.name || 'Resource';
}

function getCategoryIcon(categoryId) {
    return PRODUCT_CATEGORIES.find(category => category.id === categoryId)?.icon || '🛍️';
}

function renderProductCatalog() {
    filterProducts();
}

function filterProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const searchTerm = (document.getElementById('product-search')?.value || '').trim().toLowerCase();
    const sortValue = document.getElementById('product-sort')?.value || 'featured';

    let filteredProducts = PRODUCT_CATALOG.filter(product => {
        const matchesCategory = activeProductCategory === 'all' || product.category === activeProductCategory;
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    if (sortValue === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else {
        filteredProducts.sort((a, b) => a.rank - b.rank);
    }

    if (!filteredProducts.length) {
        grid.innerHTML = '<div class="empty-state">No products match your filters yet. Try another search or category.</div>';
        return;
    }

    const html = filteredProducts.map(product => `
        <article class="product-card">
            <img src="${product.image}" alt="${product.imageAlt || product.name}" loading="lazy">
            <div class="product-card-body">
                <span class="product-category">${getCategoryIcon(product.category)} ${getCategoryName(product.category)}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-card-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button type="button" class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `).join('');

    grid.innerHTML = html;

    grid.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.currentTarget.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
}

function getProductById(productId) {
    return PRODUCT_CATALOG.find(product => product.id === productId) || null;
}

function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({ productId, quantity: 1 });
    }

    renderCart();
    updateCartCount();
    resetOrderConfirmationMessage();
    hidePaymentPanel();
    showToast(`${product.name} added to your cart.`);
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.productId !== productId);
    renderCart();
    updateCartCount();
    resetOrderConfirmationMessage();
    hidePaymentPanel();
}

function updateCartQuantity(productId, quantity) {
    const cartItem = cartItems.find(item => item.productId === productId);
    if (!cartItem) return;

    cartItem.quantity = quantity;

    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCart();
        updateCartCount();
    }
    resetOrderConfirmationMessage();
    hidePaymentPanel();
}

function resetOrderConfirmationMessage() {
    const message = document.getElementById('order-confirmation-message');
    if (message) {
        message.textContent = '';
        message.classList.remove('error');
    }
}

function renderCart() {
    const list = document.getElementById('cart-item-list');
    const emptyState = document.getElementById('cart-empty');
    if (!list || !emptyState) return;

    if (!cartItems.length) {
        list.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        list.innerHTML = cartItems.map(item => {
            const product = getProductById(item.productId);
            if (!product) return '';
            return `
                <li class="cart-item" data-product-id="${product.id}">
                    <img src="${product.image}" alt="${product.imageAlt || product.name}">
                    <div class="cart-item-details">
                        <h4>${product.name}</h4>
                        <p class="cart-item-meta">${product.summary}</p>
                        <div class="cart-item-controls">
                            <label class="sr-only" for="cart-qty-${product.id}">Quantity for ${product.name}</label>
                            <input type="number" id="cart-qty-${product.id}" class="cart-quantity-input" data-product-id="${product.id}" min="1" value="${item.quantity}">
                            <button type="button" class="btn btn-secondary cart-remove" data-product-id="${product.id}">Remove</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <span>${formatCurrency(product.price)} each</span>
                        <span>${formatCurrency(product.price * item.quantity)}</span>
                    </div>
                </li>
            `;
        }).join('');

        list.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', handleCartQuantityChange);
            input.addEventListener('input', handleCartQuantityChange);
        });

        list.querySelectorAll('.cart-remove').forEach(button => {
            button.addEventListener('click', event => {
                const productId = event.currentTarget.getAttribute('data-product-id');
                removeFromCart(productId);
            });
        });
    }

    renderCartSummary();
    updateConfirmButtonState();
}

function handleCartQuantityChange(event) {
    const input = event.currentTarget;
    const productId = input.getAttribute('data-product-id');
    if (!productId) return;

    const quantity = parseInt(input.value, 10);
    if (Number.isNaN(quantity) || quantity < 1) {
        input.value = '1';
        updateCartQuantity(productId, 1);
        return;
    }

    updateCartQuantity(productId, quantity);
}

function renderCartSummary() {
    const totals = calculateCartTotals();

    const itemsLabel = document.getElementById('cart-items-count');
    if (itemsLabel) {
        itemsLabel.textContent = totals.itemCount === 1 ? '1 item' : `${totals.itemCount} items`;
    }

    const subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);

    const taxEl = document.getElementById('cart-tax');
    if (taxEl) taxEl.textContent = formatCurrency(totals.tax);

    const shippingEl = document.getElementById('cart-shipping');
    if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping);

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = formatCurrency(totals.total);
}

function formatCurrency(amount) {
    const value = Number(amount) || 0;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateCartTotals() {
    const subtotal = cartItems.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const tax = subtotal * 0.07;
    const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 6.5;
    const total = subtotal + tax + shipping;

    return {
        subtotal,
        tax,
        shipping,
        total,
        itemCount
    };
}

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    if (itemCount > 0) {
        badge.hidden = false;
        badge.textContent = itemCount;
    } else {
        badge.hidden = true;
    }
}

function updateConfirmButtonState() {
    const confirmBtn = document.getElementById('cart-confirm');
    if (!confirmBtn) return;

    const emailInput = document.getElementById('checkout-email');
    const emailValue = emailInput?.value.trim() || '';
    const hasValidEmail = !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

    confirmBtn.disabled = cartItems.length === 0 || !hasValidEmail || !emailValue;
}

function handleCartRecalculate(event) {
    event.preventDefault();
    renderCartSummary();
    updateConfirmButtonState();
    showToast('Cart totals updated.');
}

function generateOrderId() {
    const dateSegment = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSegment = Math.floor(100 + Math.random() * 900);
    return `BCC-${dateSegment}-${randomSegment}`;
}

function showPaymentPanel(orderId, amount) {
    const panel = document.getElementById('payment-panel');
    if (!panel) return;

    panel.hidden = false;

    const orderIdField = document.getElementById('payment-order-id');
    if (orderIdField) orderIdField.textContent = orderId;

    const amountField = document.getElementById('payment-amount');
    if (amountField) amountField.textContent = formatCurrency(amount);

    const submitAmount = document.getElementById('payment-submit-amount');
    if (submitAmount) submitAmount.textContent = formatCurrency(amount);

    const feedback = document.getElementById('payment-feedback');
    if (feedback) feedback.textContent = '';

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) paymentForm.reset();
}

function hidePaymentPanel() {
    const panel = document.getElementById('payment-panel');
    if (panel) {
        panel.hidden = true;
    }
}

function handleOrderConfirm() {
    if (!cartItems.length) {
        showToast('Add items to your cart before confirming.', true);
        return;
    }

    const emailInput = document.getElementById('checkout-email');
    const nameInput = document.getElementById('checkout-name');
    const message = document.getElementById('order-confirmation-message');

    if (!emailInput || !message) return;

    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = 'Enter a valid email address so we can send your receipt and tracking updates.';
        message.classList.add('error');
        emailInput.focus();
        return;
    }

    const contactName = nameInput?.value.trim() || 'BCC Kids Family';
    const totals = calculateCartTotals();
    const orderId = generateOrderId();
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const orderItems = cartItems.map(item => {
        const product = getProductById(item.productId);
        return {
            productId: item.productId,
            name: product?.name || 'Resource',
            quantity: item.quantity,
            price: product?.price || 0
        };
    });

    pendingOrderRecord = {
        id: orderId,
        name: contactName,
        email,
        status: 'Awaiting Payment',
        placedOn: new Date().toISOString(),
        estimatedDelivery: estimatedDelivery.toISOString(),
        total: totals.total,
        items: orderItems,
        statusHistory: [
            { label: 'Awaiting payment', timestamp: new Date().toISOString() },
            { label: 'Order created', timestamp: new Date().toISOString() }
        ]
    };

    ORDER_HISTORY = [
        pendingOrderRecord,
        ...ORDER_HISTORY.filter(order => order.id !== pendingOrderRecord.id)
    ];

    message.textContent = `Order ${orderId} is reserved for ${formatCurrency(totals.total)}. Please complete payment below to finalize your shipment.`;
    message.classList.remove('error');

    showPaymentPanel(orderId, totals.total);
    showToast('Order confirmed! Complete payment to finish checkout.');
}

function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!pendingOrderRecord) {
        showToast('Confirm your order before submitting payment.', true);
        return;
    }

    const timestamp = new Date().toISOString();
    pendingOrderRecord.status = 'Payment received - preparing for shipment';
    pendingOrderRecord.statusHistory = [
        { label: 'Payment received', timestamp },
        ...pendingOrderRecord.statusHistory
    ];

    ORDER_HISTORY = ORDER_HISTORY.map(order =>
        order.id === pendingOrderRecord.id
            ? {
                ...pendingOrderRecord,
                items: pendingOrderRecord.items.map(item => ({ ...item })),
                statusHistory: pendingOrderRecord.statusHistory.map(entry => ({ ...entry }))
            }
            : order
    );

    const feedback = document.getElementById('payment-feedback');
    if (feedback) {
        feedback.textContent = `Payment received! A receipt will be sent to ${pendingOrderRecord.email}.`;
    }

    lastCompletedOrder = {
        ...pendingOrderRecord,
        items: pendingOrderRecord.items.map(item => ({ ...item })),
        statusHistory: pendingOrderRecord.statusHistory.map(entry => ({ ...entry }))
    };

    cartItems = [];
    renderCart();
    updateCartCount();
    updateConfirmButtonState();
    hidePaymentPanel();
    resetOrderConfirmationMessage();

    showToast('Payment processed successfully!');

    setTimeout(() => {
        showPage('order-status');
        if (lastCompletedOrder) {
            renderOrderStatusResult(lastCompletedOrder);
            const orderInput = document.getElementById('order-status-id');
            if (orderInput) {
                orderInput.value = lastCompletedOrder.id;
            }
            const emailInput = document.getElementById('order-status-email');
            if (emailInput) {
                emailInput.value = lastCompletedOrder.email;
            }
        }
    }, 900);

    pendingOrderRecord = null;
}

function handleOrderStatusLookup(event) {
    event.preventDefault();

    const orderIdInput = document.getElementById('order-status-id');
    const emailInput = document.getElementById('order-status-email');

    if (!orderIdInput) return;

    const orderId = orderIdInput.value.trim();
    const email = emailInput?.value.trim() || '';

    const order = findOrderRecord(orderId, email);
    renderOrderStatusResult(order);
}

function findOrderRecord(orderId, email) {
    if (!orderId) return null;

    const normalizedId = orderId.replace(/\s+/g, '').toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    return ORDER_HISTORY.find(order => {
        const matchesId = order.id.replace(/\s+/g, '').toUpperCase() === normalizedId;
        const matchesEmail = !normalizedEmail || order.email?.toLowerCase() === normalizedEmail;
        return matchesId && matchesEmail;
    }) || null;
}

function renderOrderStatusResult(order) {
    const container = document.getElementById('order-status-result');
    if (!container) return;

    if (!order) {
        container.innerHTML = `
            <div class="order-status-placeholder error">
                <h3>We couldn't find that order</h3>
                <p>Double-check your confirmation number and email, then try again or start a chat with our support team.</p>
            </div>
        `;
        return;
    }

    const itemsMarkup = (order.items || []).map(item => `
        <li>
            <span>${item.quantity} × ${item.name}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        </li>
    `).join('');

    const timelineMarkup = (order.statusHistory || []).map(entry => `
        <li>
            <span>${entry.label}</span>
            <time>${formatOrderTimestamp(entry.timestamp)}</time>
        </li>
    `).join('');

    container.innerHTML = `
        <div class="order-status-card">
            <h3>Order ${order.id}</h3>
            <p class="order-status-current"><strong>Status:</strong> ${order.status || 'Processing'}</p>
            <dl>
                <div><dt>Placed</dt><dd>${formatOrderDate(order.placedOn)}</dd></div>
                <div><dt>Contact</dt><dd>${order.name || '—'}</dd></div>
                <div><dt>Total</dt><dd>${formatCurrency(order.total)}</dd></div>
                <div><dt>Est. Delivery</dt><dd>${formatOrderDate(order.estimatedDelivery)}</dd></div>
            </dl>
            <h4>Items</h4>
            <ul class="order-item-list">${itemsMarkup}</ul>
            <h4>Recent Updates</h4>
            <ol class="order-status-timeline">${timelineMarkup}</ol>
        </div>
    `;
}

function formatOrderDate(value) {
    const date = parseOrderDate(value);
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatOrderTimestamp(value) {
    const date = parseOrderDate(value);
    if (!date) return '';
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function parseOrderDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatChatTimestamp(value) {
    const date = parseOrderDate(value);
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const CUSTOMER_CHAT_OPENERS = [
    'Hi there! 👋 I\'m Grace from the BCC Kids store. How can I help with your order today?',
    'Ask me about order status, curriculum bundles, or payment questions and I\'ll get you quick answers.'
];

let customerChatInitialized = false;
let customerChatTranscript = [];

function renderCustomerChat() {
    const chatWindow = document.getElementById('customer-chat-window');
    if (!chatWindow) return;

    if (!customerChatTranscript.length) {
        chatWindow.innerHTML = '<p class="chat-placeholder">Start a conversation and our team will jump in shortly.</p>';
        return;
    }

    chatWindow.innerHTML = customerChatTranscript.map(message => `
        <div class="chat-message ${message.sender === 'agent' ? 'agent' : 'customer'}">
            <p>${message.text}</p>
            <time>${formatChatTimestamp(message.timestamp)}</time>
        </div>
    `).join('');

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function initializeCustomerChat() {
    const chatWindow = document.getElementById('customer-chat-window');
    if (!chatWindow) return;

    if (!customerChatInitialized) {
        customerChatTranscript = CUSTOMER_CHAT_OPENERS.map(text => ({
            sender: 'agent',
            text,
            timestamp: new Date().toISOString()
        }));
        customerChatInitialized = true;
    }

    renderCustomerChat();
}

function appendCustomerChatMessage(sender, text) {
    customerChatTranscript.push({
        sender,
        text,
        timestamp: new Date().toISOString()
    });
    renderCustomerChat();
}

function handleCustomerChatSubmit(event) {
    event.preventDefault();

    const input = document.getElementById('customer-chat-input');
    if (!input) return;

    const messageText = input.value.trim();
    if (!messageText) return;

    appendCustomerChatMessage('customer', messageText);
    input.value = '';
    input.focus();

    setTimeout(() => {
        appendCustomerChatMessage('agent', getAutomatedChatReply(messageText));
    }, 650);
}

function getAutomatedChatReply(messageText) {
    const normalized = messageText.toLowerCase();

    if (normalized.includes('shipping') || normalized.includes('delivery')) {
        return 'Shipping update: orders leave our Indiana hub within 2 business days. You\'ll receive tracking via email as soon as a label is created.';
    }

    if (normalized.includes('status') || normalized.includes('order')) {
        return 'To check status quickly, enter your confirmation number on the Order Status tab. I can look it up for you if you share the number here too!';
    }

    if (normalized.includes('payment') || normalized.includes('card')) {
        return 'All payments are processed securely. We accept major cards and church purchase orders—just let us know if you need an invoice.';
    }

    if (normalized.includes('bulk') || normalized.includes('discount')) {
        return 'Great news—orders of 10 or more kits automatically receive tiered discounts in the cart. I can build a custom quote if you share quantities.';
    }

    return 'Thanks for reaching out! A team member will join the conversation shortly. Meanwhile, let me know your order number or question and we\'ll get it handled.';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMarketplace();

    const recalcBtn = document.getElementById('cart-recalculate');
    if (recalcBtn) {
        recalcBtn.addEventListener('click', handleCartRecalculate);
    }

    const confirmBtn = document.getElementById('cart-confirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleOrderConfirm);
    }

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    const orderStatusForm = document.getElementById('order-status-form');
    if (orderStatusForm) {
        orderStatusForm.addEventListener('submit', handleOrderStatusLookup);
    }

    const checkoutEmail = document.getElementById('checkout-email');
    if (checkoutEmail) {
        checkoutEmail.addEventListener('input', updateConfirmButtonState);
    }

    const chatForm = document.getElementById('customer-chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', handleCustomerChatSubmit);
    }
});

function handleParentChatSubmit() {
    const input = document.getElementById('parent-chat-input');
    if (!input) return;

    const messageText = input.value.trim();
    if (!messageText) return;

    // Use API controller to send message
    ParentPortalController.sendParentMessage(messageText, 'teacher-001').catch(error => {
        console.error('Chat submission failed:', error);
    });
}
