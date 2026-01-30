// Curated Learning Resources with Real, Working URLs
// These are verified, high-quality resources for various career paths

const learningResources = {
    "Full Stack Developer": {
        youtube: [
            { name: "freeCodeCamp Full Stack Course", url: "https://www.youtube.com/watch?v=nu_pCVPKzTk" },
            { name: "Traversy Media MERN Stack", url: "https://www.youtube.com/watch?v=-0exw-9YJBo" },
            { name: "Web Dev Simplified", url: "https://www.youtube.com/@WebDevSimplified" }
        ],
        courses: [
            { name: "The Odin Project (Free)", url: "https://www.theodinproject.com/" },
            { name: "freeCodeCamp Full Stack", url: "https://www.freecodecamp.org/learn/full-stack-developer/" },
            { name: "Full Stack Open (University of Helsinki)", url: "https://fullstackopen.com/en/" }
        ],
        certifications: [
            { name: "Meta Front-End Developer", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
            { name: "Meta Back-End Developer", url: "https://www.coursera.org/professional-certificates/meta-back-end-developer" },
            { name: "IBM Full Stack Cloud Developer", url: "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer" }
        ],
        documentation: [
            { name: "MDN Web Docs", url: "https://developer.mozilla.org/" },
            { name: "React Documentation", url: "https://react.dev/" },
            { name: "Node.js Docs", url: "https://nodejs.org/docs/" }
        ]
    },

    "Visual Designer": {
        youtube: [
            { name: "The Futur - Design Principles", url: "https://www.youtube.com/@TheFuturIsHere" },
            { name: "Flux Academy - UI/UX Design", url: "https://www.youtube.com/@FluxAcademy" },
            { name: "DesignCourse", url: "https://www.youtube.com/@DesignCourse" }
        ],
        courses: [
            { name: "Google UX Design Professional Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
            { name: "Interaction Design Foundation", url: "https://www.interaction-design.org/" },
            { name: "Canva Design School (Free)", url: "https://www.canva.com/designschool/" }
        ],
        certifications: [
            { name: "Google UX Design Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
            { name: "Adobe Certified Professional", url: "https://www.adobe.com/training/certification.html" },
            { name: "Nielsen Norman Group UX Certification", url: "https://www.nngroup.com/ux-certification/" }
        ],
        documentation: [
            { name: "Material Design Guidelines", url: "https://m3.material.io/" },
            { name: "Apple Human Interface Guidelines", url: "https://developer.apple.com/design/human-interface-guidelines/" },
            { name: "Figma Learn", url: "https://www.figma.com/resources/learn-design/" }
        ]
    },

    "Frontend Developer": {
        youtube: [
            { name: "freeCodeCamp React Course", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
            { name: "Net Ninja React Tutorials", url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d" },
            { name: "JavaScript Mastery", url: "https://www.youtube.com/@javascriptmastery" }
        ],
        courses: [
            { name: "Frontend Masters", url: "https://frontendmasters.com/" },
            { name: "Scrimba Frontend Career Path", url: "https://scrimba.com/learn/frontend" },
            { name: "freeCodeCamp Responsive Web Design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" }
        ],
        certifications: [
            { name: "Meta Front-End Developer", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
            { name: "W3Schools Frontend Certification", url: "https://www.w3schools.com/cert/cert_frontend.asp" }
        ],
        documentation: [
            { name: "MDN Web Docs", url: "https://developer.mozilla.org/" },
            { name: "React Docs", url: "https://react.dev/" },
            { name: "CSS-Tricks", url: "https://css-tricks.com/" }
        ]
    },

    "Backend Developer": {
        youtube: [
            { name: "freeCodeCamp Node.js Full Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
            { name: "Traversy Media Node.js", url: "https://www.youtube.com/@TraversyMedia" },
            { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh" }
        ],
        courses: [
            { name: "The Odin Project NodeJS", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs" },
            { name: "freeCodeCamp Backend Development", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/" },
            { name: "Udemy: Node.js Topics", url: "https://www.udemy.com/topic/nodejs/" }
        ],
        certifications: [
            { name: "Meta Back-End Developer", url: "https://www.coursera.org/professional-certificates/meta-back-end-developer" },
            { name: "MongoDB Certified Developer", url: "https://learn.mongodb.com/catalog" }
        ],
        documentation: [
            { name: "Node.js Documentation", url: "https://nodejs.org/docs/" },
            { name: "Express.js Guide", url: "https://expressjs.com/" },
            { name: "MongoDB Manual", url: "https://www.mongodb.com/docs/" }
        ]
    },

    "Data Scientist": {
        youtube: [
            { name: "freeCodeCamp Data Science", url: "https://www.youtube.com/watch?v=ua-CiDNNj30" },
            { name: "StatQuest", url: "https://www.youtube.com/@statquest" },
            { name: "3Blue1Brown (Math)", url: "https://www.youtube.com/@3blue1brown" }
        ],
        courses: [
            { name: "IBM Data Science Professional", url: "https://www.coursera.org/professional-certificates/ibm-data-science" },
            { name: "Google Data Analytics", url: "https://www.coursera.org/professional-certificates/google-data-analytics" },
            { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" }
        ],
        certifications: [
            { name: "IBM Data Science Professional", url: "https://www.coursera.org/professional-certificates/ibm-data-science" },
            { name: "Google Data Analytics", url: "https://www.coursera.org/professional-certificates/google-data-analytics" }
        ],
        documentation: [
            { name: "Python Documentation", url: "https://docs.python.org/3/" },
            { name: "Pandas Documentation", url: "https://pandas.pydata.org/docs/" },
            { name: "Scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html" }
        ]
    },

    "Mobile Developer": {
        youtube: [
            { name: "freeCodeCamp React Native", url: "https://www.youtube.com/watch?v=obH0Po_RdWk" },
            { name: "Flutter Tutorial for Beginners", url: "https://www.youtube.com/watch?v=1ukSR1GRtMU" },
            { name: "iOS Academy", url: "https://www.youtube.com/@iOSAcademy" }
        ],
        courses: [
            { name: "Meta React Native Specialization", url: "https://www.coursera.org/specializations/meta-react-native" },
            { name: "Udemy: Flutter & Dart", url: "https://www.udemy.com/topic/flutter/" },
            { name: "freeCodeCamp Mobile Development", url: "https://www.freecodecamp.org/news/tag/mobile-development/" }
        ],
        certifications: [
            { name: "Meta React Native Certificate", url: "https://www.coursera.org/specializations/meta-react-native" },
            { name: "Google Associate Android Developer", url: "https://developers.google.com/certification/associate-android-developer" }
        ],
        documentation: [
            { name: "React Native Docs", url: "https://reactnative.dev/docs/getting-started" },
            { name: "Flutter Documentation", url: "https://docs.flutter.dev/" },
            { name: "Swift Documentation", url: "https://developer.apple.com/documentation/swift" }
        ]
    },

    "DevOps Engineer": {
        youtube: [
            { name: "freeCodeCamp DevOps Course", url: "https://www.youtube.com/watch?v=j5Zsa_eOXeY" },
            { name: "TechWorld with Nana", url: "https://www.youtube.com/@TechWorldwithNana" },
            { name: "DevOps Toolkit", url: "https://www.youtube.com/@DevOpsToolkit" }
        ],
        courses: [
            { name: "Udemy: Docker & Kubernetes", url: "https://www.udemy.com/topic/docker/" },
            { name: "Linux Foundation DevOps", url: "https://training.linuxfoundation.org/training/devops-and-sre-fundamentals/" },
            { name: "AWS DevOps Engineer", url: "https://aws.amazon.com/training/learn-about/devops/" }
        ],
        certifications: [
            { name: "AWS Certified DevOps Engineer", url: "https://aws.amazon.com/certification/certified-devops-engineer-professional/" },
            { name: "Certified Kubernetes Administrator", url: "https://www.cncf.io/certification/cka/" },
            { name: "Docker Certified Associate", url: "https://training.mirantis.com/certification/dca-certification-exam/" }
        ],
        documentation: [
            { name: "Docker Documentation", url: "https://docs.docker.com/" },
            { name: "Kubernetes Docs", url: "https://kubernetes.io/docs/" },
            { name: "AWS Documentation", url: "https://docs.aws.amazon.com/" }
        ]
    },

    "Cloud Engineer": {
        youtube: [
            { name: "freeCodeCamp AWS Course", url: "https://www.youtube.com/watch?v=ulprqHHWlng" },
            { name: "A Cloud Guru", url: "https://www.youtube.com/@AcloudGuru" },
            { name: "Google Cloud Tech", url: "https://www.youtube.com/@GoogleCloudTech" }
        ],
        courses: [
            { name: "AWS Training", url: "https://aws.amazon.com/training/" },
            { name: "Google Cloud Skills Boost", url: "https://www.cloudskillsboost.google/" },
            { name: "Microsoft Learn Azure", url: "https://learn.microsoft.com/en-us/training/azure/" }
        ],
        certifications: [
            { name: "AWS Certified Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
            { name: "Google Cloud Professional", url: "https://cloud.google.com/learn/certification" },
            { name: "Azure Administrator", url: "https://learn.microsoft.com/en-us/certifications/azure-administrator/" }
        ],
        documentation: [
            { name: "AWS Documentation", url: "https://docs.aws.amazon.com/" },
            { name: "Google Cloud Docs", url: "https://cloud.google.com/docs" },
            { name: "Azure Documentation", url: "https://learn.microsoft.com/en-us/azure/" }
        ]
    },

    "Cybersecurity Analyst": {
        youtube: [
            { name: "freeCodeCamp Ethical Hacking", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" },
            { name: "NetworkChuck", url: "https://www.youtube.com/@NetworkChuck" },
            { name: "John Hammond", url: "https://www.youtube.com/@_JohnHammond" }
        ],
        courses: [
            { name: "Google Cybersecurity Professional", url: "https://www.coursera.org/professional-certificates/google-cybersecurity" },
            { name: "TryHackMe Learning Paths", url: "https://tryhackme.com/paths" },
            { name: "Cybrary Free Courses", url: "https://www.cybrary.it/" }
        ],
        certifications: [
            { name: "CompTIA Security+", url: "https://www.comptia.org/certifications/security" },
            { name: "Certified Ethical Hacker (CEH)", url: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/" },
            { name: "Google Cybersecurity Certificate", url: "https://www.coursera.org/professional-certificates/google-cybersecurity" }
        ],
        documentation: [
            { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
            { name: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
            { name: "Kali Linux Documentation", url: "https://www.kali.org/docs/" }
        ]
    },

    "Product Manager": {
        youtube: [
            { name: "Product School", url: "https://www.youtube.com/@ProductSchool" },
            { name: "Lenny's Podcast", url: "https://www.youtube.com/@LennysPodcast" },
            { name: "freeCodeCamp Product Management", url: "https://www.youtube.com/watch?v=G9sX5fZHJD8" }
        ],
        courses: [
            { name: "Google Project Management", url: "https://www.coursera.org/professional-certificates/google-project-management" },
            { name: "Product School Free Courses", url: "https://productschool.com/free-product-management-resources" },
            { name: "Udemy: Product Management", url: "https://www.udemy.com/topic/product-management/" }
        ],
        certifications: [
            { name: "Google Project Management", url: "https://www.coursera.org/professional-certificates/google-project-management" },
            { name: "SAFe Product Owner", url: "https://scaledagile.com/training/safe-product-owner-product-manager/" }
        ],
        documentation: [
            { name: "Product Management Handbook", url: "https://handbook.productmanager.com/" },
            { name: "Pragmatic Institute Resources", url: "https://www.pragmaticinstitute.com/resources/" },
            { name: "Mind the Product", url: "https://www.mindtheproduct.com/" }
        ]
    }
};

// Helper function to sanitize a link and ensure it is not a placeholder
function sanitizeLink(linkObj, type = 'resource') {
    if (!linkObj || !linkObj.url) return linkObj;

    const url = linkObj.url.toLowerCase();
    const isPlaceholder = url.includes('actual-url.com') ||
        url.includes('example.com') ||
        url.includes('course-url.com') ||
        url.includes('docs-url.com') ||
        url.includes('youtube.com/video') ||
        (url.startsWith('https://...') || url.startsWith('http://...'));

    if (isPlaceholder) {
        // Replace with a useful search query
        const query = encodeURIComponent(linkObj.name || 'tutorial');
        if (type === 'youtube') {
            linkObj.url = `https://www.youtube.com/results?search_query=${query}+tutorial`;
        } else if (type === 'certification') {
            linkObj.url = `https://www.coursera.org/search?query=${query}`;
        } else {
            linkObj.url = `https://www.google.com/search?q=${query}+learning+resources`;
        }
    }

    return linkObj;
}

// Helper function to get resources for a specific role
function getResourcesForRole(role) {
    if (!role) return learningResources["Full Stack Developer"];

    // Normalize role name
    const normalizedRole = role.trim();

    // Direct match
    if (learningResources[normalizedRole]) {
        return learningResources[normalizedRole];
    }

    // Fuzzy match for variations
    const lowerRole = normalizedRole.toLowerCase();
    for (const [key, value] of Object.entries(learningResources)) {
        if (lowerRole.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerRole)) {
            return value;
        }
    }

    // Check specific keywords for better matching than the fallback
    if (lowerRole.includes('design') || lowerRole.includes('ui') || lowerRole.includes('ux')) {
        return learningResources["Visual Designer"];
    }
    if (lowerRole.includes('data') || lowerRole.includes('ml') || lowerRole.includes('ai')) {
        return learningResources["Data Scientist"];
    }
    if (lowerRole.includes('security') || lowerRole.includes('cyber')) {
        return learningResources["Cybersecurity Analyst"];
    }
    if (lowerRole.includes('cloud') || lowerRole.includes('aws') || lowerRole.includes('azure')) {
        return learningResources["Cloud Engineer"];
    }

    // Default fallback - return Full Stack Developer resources
    return learningResources["Full Stack Developer"];
}

// Export for use in server routes
module.exports = {
    learningResources,
    getResourcesForRole,
    sanitizeLink
};
