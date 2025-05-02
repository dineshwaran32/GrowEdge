// Utility to capitalize the first letter of a word
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Utility to clean extra spaces and trim sentences
function cleanSentence(sentence) {
  return sentence.replace(/\s+/g, ' ').trim();
}

// Utility to normalize text for better matching
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s+#.]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Utility to escape special characters in regex patterns
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractStructuredInfo(text) {
  const output = {
    SoftSkills: [],
    HardSkills: [],
    Experience: [],
  };

  // Less aggressive text filtering
  const filteredText = text
    .replace(/(\r\n|\n|\r)/gm, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
    .toLowerCase();                   // Convert to lowercase for better matching

  const softSkillsList = [
    'communication', 'teamwork', 'leadership', 'time management', 'problem solving',
    'adaptability', 'critical thinking', 'creativity', 'decision making',
    'conflict resolution', 'interpersonal', 'active listening', 'organization',
    'self-motivated', 'work ethic', 'detail oriented', 'flexibility',
    'positive attitude', 'analytical', 'collaboration', 'team player',
    'project management', 'mentoring', 'multitasking', 'presentation',
    'strategic thinking', 'negotiation', 'planning', 'coordinating',
    'problem-solving', 'team-building', 'time-management'
  ];

  const hardSkillsList = {
    // Programming Languages
    'languages': ['java', 'python', 'c', 'c\\+\\+', 'javascript', 'typescript', 'php', 'ruby', 'scala', 'kotlin', 'swift', 'r', 'matlab', 'go', 'rust', 'perl'],
    
    // Web Technologies
    'web': ['html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'react', 'angular', 'vue', 'next\\.js', 'node\\.js', 'express\\.js', 'django', 'flask', 'spring', 'asp\\.net'],
    
    // Databases
    'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'cassandra', 'elasticsearch', 'dynamodb', 'firebase'],
    
    // Cloud & DevOps
    'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible'],
    
    // Data Science & AI
    'ai_ml': ['tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'data mining', 'statistics'],
    
    // Version Control
    'vcs': ['git', 'github', 'gitlab', 'bitbucket', 'svn'],
    
    // Testing
    'testing': ['junit', 'selenium', 'jest', 'cypress', 'mocha', 'pytest', 'testng'],
    
    // ECE & EEE
    'electrical': ['verilog', 'vhdl', 'embedded systems', 'microcontroller', 'arduino', 'raspberry pi', 'arm', 'pcb design', 'circuit design', 'fpga', 'plc'],
    
    // Mechanical
    'mechanical': ['autocad', 'solidworks', 'catia', 'creo', 'ansys', 'nx', 'inventor', 'fusion 360', 'cfd', 'fea', '3d modeling', 'gd&t'],
    
    // Civil
    'civil': ['revit', 'tekla', 'staad pro', 'etabs', 'sap2000', 'primavera', 'procore', 'civil 3d', 'structural analysis'],
    
    // Tools & IDEs
    'tools': ['vs code', 'visual studio', 'eclipse', 'intellij', 'android studio', 'xcode', 'postman', 'jira', 'confluence'],
    
    // Mobile Development
    'mobile': ['android', 'ios', 'react native', 'flutter', 'xamarin', 'swift', 'kotlin'],
    
    // Operating Systems
    'os': ['linux', 'unix', 'windows', 'macos', 'shell scripting', 'bash']
  };

  // Extract soft skills with fuzzy matching
  const normalizedText = normalizeText(filteredText);
  for (const skill of softSkillsList) {
    // Escape special characters in the skill name
    const escapedSkill = escapeRegex(skill);
    const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (skillRegex.test(normalizedText)) {
      output.SoftSkills.push(capitalize(skill));
    }
  }

  // Extract hard skills with variations and context
  for (const [category, skills] of Object.entries(hardSkillsList)) {
    for (const skill of skills) {
      // Look for the skill with word boundaries
      const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
      if (skillRegex.test(normalizedText)) {
        // Special handling for C++ to display it properly
        const displaySkill = skill === 'c\\+\\+' ? 'C++' : skill.toUpperCase();
        output.HardSkills.push(displaySkill);
      }
    }
  }

  // Extract experience with more context
  const experienceMatches = filteredText.match(
    /.{0,50}(project|developed|designed|implemented|created|built|managed|led|achieved|improved|optimized|analyzed).{0,100}/gi
  );
  if (experienceMatches) {
    output.Experience = experienceMatches
      .map(cleanSentence)
      .filter(exp => exp.length > 20); // Filter out very short matches
  }

  // Remove duplicates and sort
  output.SoftSkills = [...new Set(output.SoftSkills)].sort();
  output.HardSkills = [...new Set(output.HardSkills)].sort();
  output.Experience = [...new Set(output.Experience)];

  return output;
}

export default extractStructuredInfo;
