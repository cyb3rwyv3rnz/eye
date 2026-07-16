// BCIA Intelligence System - Advanced Dashboard with Activity Tracking
const API_URL = window.location.origin;

// State management
const state = {
    // SECURITY FIX: session lives only in an httpOnly cookie now (see auth.js) —
    // no token is ever stored in localStorage or held here.
    user: JSON.parse(localStorage.getItem('bcia_user') || '{}'),
    currentDb: null,
    currentCity: null,
    currentGovernorate: null,
    personType: null,
    allFields: {},
    results: [],
    currentPage: 0,
    resultsPerPage: 10,
    language: localStorage.getItem('bcia_language') || 'en',
    searchHistory: [],
    recentSearches: [],
    bookmarks: []
};

let sessionCheckInterval = null;

async function validateSession() {
    try {
        const response = await fetch(`${API_URL}/api/verify`, {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        // If logout flag is set or verification failed, force logout
        if (!response.ok || data.logout || !data.success) {
            console.log('Session invalidated:', data.error);
            forceLogout(data.error || 'Session expired');
        }
    } catch (error) {
        console.error('Session validation error:', error);
        // Don't logout on network errors - only on explicit rejection
    }
}

function forceLogout(reason) {
    // Stop session checking
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    
    // Clear all stored data
    localStorage.removeItem('bcia_user');
    // SECURITY FIX: actually clear the httpOnly session cookie server-side,
    // not just local UI state — otherwise the session stays valid on a shared
    // computer even after the app "logs out".
    fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});

    // Show alert ONLY if reason is "Session terminated" AND we haven't shown it before
    const wasTerminated = localStorage.getItem('bcia_was_terminated');
    
    if (reason && reason.toLowerCase().includes('session terminated') && !wasTerminated) {
        localStorage.setItem('bcia_was_terminated', 'true');
        alert('⚠️ SESSION TERMINATED BY ADMINISTRATOR\n\nYou have been logged out.');
    }
    
    // Redirect to login page
    window.location.href = '/';
}

// Start session validation when page loads
function startSessionValidation() {
    // Validate immediately
    validateSession();
    
    // Then check every 10 seconds
    sessionCheckInterval = setInterval(validateSession, 10000);
}

// Complete Translations with corrected Kurdish Sorani
const translations = {
    en: {
        titleofsys : 'The State\'s Eye INTELLIGENCE SYSTEMS',
        // UI elements
        language: 'EN',
        systemActive: 'SYSTEM ACTIVE',
        connection: 'CONNECTION',
        secure: 'SECURE',
        clearanceLabel: 'CLEARANCE',
        adminAccess: 'Ops Center',
        disconnect: 'EXIT',

        homeNav: 'Command Center',
        databasesNav: 'Intelligence Modules',
        navOverview: 'OVERVIEW',
        crumbRoot: 'BCIA',
        cmdkTrigger: 'Search modules…',
        homeWelcome: 'Welcome back',
        homeSub: 'Real-time overview of your intelligence workspace',
        kpiDatabasesLabel: 'Modules Available',
        kpiSearchesLabel: 'Queries Executed',
        kpiBookmarksLabel: 'Entities Bookmarked',
        kpiClearanceLabel: 'Clearance Level',
        searchActivityTitle: 'Query Activity',
        searchActivitySub: 'LAST 7 DAYS',
        recentActivityTitle: 'Live Activity Feed',
        quickAccessTitle: 'Quick Access',
        coreRegistriesGroup: 'Core Registries',
        telecomServicesGroup: 'Telecom & OSINT',
        peopleRelationsGroup: 'Relationship Intelligence',
        intelligenceToolsGroup: 'Threat & Operator Tools',
        fibLockedBtn: 'TEMPORARILY LOCKED',
        cmdkNoResults: 'No matching modules or actions',
        cmdkActionsGroup: 'ACTIONS',
        cmdkModulesGroup: 'MODULES',
        cmdkActionHome: 'Go to Command Center',
        cmdkActionDatabases: 'Go to Intelligence Modules',
        cmdkActionProfile: 'Open Profile',
        cmdkActionLogout: 'Disconnect Session',

           profile: 'PROFILE',
    userProfile: 'AGENT PROFILE',
    searchHistory: 'SEARCH HISTORY',
    changePassword: 'CHANGE PASSWORD',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordChanged: '✓ Password changed successfully',
    passwordChangeFailed: '⚠️ Password change failed',
    searchedOn: 'Searched on',
    noSearchHistory: 'No search history yet',
    clearHistory: 'Clear History',

    aiDatabase: 'Cyb3r Drag0nz AI',
aiDesc: 'CLASSIFIED: Direct neural interface with Cyb3r Drag0nz intelligence system. Unrestricted tactical AI assistant.',
aiAccess: 'ACCESS AI TERMINAL',
aiOnline: 'ONLINE',
aiOffline: 'OFFLINE',
aiModel: 'MODEL: Cyb3r-Drag0nz:latest',
aiWelcomeTitle: 'Cyb3r Drag0nzONLINE',
aiWelcomeDesc: 'Neural link established. Ask anything.',
aiWelcomeSubDesc: 'Running locally via Cyb3r Drag0nz',
aiPlaceholder: 'Enter your query for Cyb3r Drag0nz...',
aiYou: '▸ YOU',
aiDragon: '▸ CYBER DRAGON',
aiSystem: '▸ SYSTEM',
aiClear: 'CLR',
aiSend: '►',
aiOfflineMsg: '⚠ Ai OFFLINE\n\nMake sure ai is running on the server',
aiShortcut: 'ENTER to send • SHIFT+ENTER for new line',

gender: 'Gender',
School: 'City or School/Institute',

shadDatabase: 'CAMERA HACK',
shadDesc: 'CLASSIFIED: Camera hack network servers for generating secure phishing intelligence pages.',
shadSelectBot: 'SELECT CAMERA HACK LINK (Username: shad, Password: shad)',
shadSelectBotDesc: 'Choose which Camera Hack network server to activate',
shadActivate: 'ACTIVATE SERVER',
shadTitleStep: 'ENTER PAGE TITLE',
shadTitleDesc: 'Server is ready. Enter the title for the intelligence page.',
shadTitleLabel: 'PAGE TITLE',
shadTitlePlaceholder: 'Enter page title...',
shadSendTitle: 'SEND TITLE',
shadOgStep: 'UPLOAD OG IMAGE',
shadOgDesc: 'Upload the OG (preview) image for the page.',
shadUploadOg: 'CLICK TO UPLOAD OG IMAGE',
shadSendOg: 'SEND OG IMAGE',
shadBgStep: 'UPLOAD BACKGROUND IMAGE',
shadBgDesc: 'Upload the background image for the page.',
shadUploadBg: 'CLICK TO UPLOAD BACKGROUND IMAGE',
shadSendBg: 'SEND BACKGROUND IMAGE',
shadComplete: 'INTELLIGENCE PAGE GENERATED',
shadShareLink: 'SEND TO VICTIM',
shadResultLink: 'RESULTS LINK',
shadNewSession: 'NEW SESSION',
shadClose: 'CLOSE',
shadConnecting: 'CONNECTING TO SERVER...',
shadSending: 'SENDING TITLE...',
shadSendingImage: 'SENDING IMAGE...',
shadWait: 'Please wait for server response...',


cveDatabase: 'CVE INTELLIGENCE DATABASE',
cveDesc: 'CLASSIFIED: Latest vulnerabilities, severity tracking, CVE search, and exploit intelligence feed.',
cveAccess: 'ACCESS CVE DATABASE',
cveReady: 'CVE DATABASE READY',
cveReadyDesc: 'Click LATEST to load recent CVEs or search by CVE ID',
cveTotal: 'TOTAL RECORDS',
cveNotFound: 'NO CVE RECORDS FOUND',
cveConnFailed: '⚠ CONNECTION FAILED',
cveRetry: '↺ RETRY',
cveLatest: '↺ LATEST',
cveSearch: 'SEARCH',
cveSearchPlaceholder: 'Search CVE ID (e.g. CVE-2024-1234)...',
cveAllSeverities: 'ALL SEVERITIES',
cveSource: 'SOURCE: NVD / NIST — LIVE FEED',
cveScanning: 'SCANNING CVE DATABASE...',
cveDecrypting: 'CONNECTING TO NVD — DECRYPTING RECORDS...',
cvePublished: 'PUBLISHED',
cveModified: 'LAST MODIFIED',
cveCwe: 'CWE',
cveVector: 'VECTOR',
cveReferences: 'REFERENCES',
cveScore: 'CVSS SCORE',

peshmergaDatabase: 'PESHMERGA POWER',
peshmergaDesc: 'CLASSIFIED: Breach database search, stealer informations, and credential intelligence. Limited to 5 searches per 24 hours.',
peshmergaAccess: 'ACCESS PESHMERGA POWER',
peshmergaQuota: 'QUOTA',
peshmergaBreachSearch: 'BREACH SEARCH',
peshmergaStealerinformations: 'STEALER informations',
peshmergaVictimSearch: 'VICTIM SEARCH',
peshmergaHintBreach: 'BREACH: Search by email address — finds credentials from known data breaches',
peshmergaHintStealer: 'STEALER: Search by domain or email — finds data from malware stealer informations',
peshmergaHintVictim: 'VICTIM: Search compromised accounts and victim profiles',
peshmergaPlaceholderBreach: 'Enter email address (e.g. user@example.com)...',
peshmergaPlaceholderStealer: 'Enter domain or email (e.g. example.com)...',
peshmergaPlaceholderVictim: 'Enter username, email, or keyword...',
peshmergaOnline: 'PESHMERGA POWER ONLINE',
peshmergaOnlineDesc: 'Enter a query above to search the breach intelligence database.',
peshmergaOnlineDesc2: 'Each search uses 1 of your 5 daily credits.',
peshmergaNoResults: 'NO RECORDS FOUND',
peshmergaNoResultsDesc: 'No breach data found for',
peshmergaQuotaWarning: 'Each search consumes 1 daily credit (5 per 24h)',
peshmergaDailyLimit: 'DAILY LIMIT REACHED',
peshmergaUpgrade: 'CONTACT ADMINISTRATOR',
        
        // Database titles
        vehicleDatabase: 'VEHICLE DATABASE',
        personnelDatabase: 'PERSONNEL DATABASE',
        cityDatabase: 'CITY REGISTRY DATABASE',
        
        // Database descriptions
        vehicleDesc: 'CLASSIFIED: Vehicle registration records, automotive intelligence data, and transportation surveillance systems.',
        personnelDesc: 'TOP SECRET: Personnel dossiers, employment records, and citizen intelligence data.',
        cityDesc: 'RESTRICTED: Family records, residential intelligence, and citizen identification data.',

        karabaDatabase: 'ELECTRICITY METER DATABASE',
        karabaDesc: 'CLASSIFIED: Electricity meter surveillance, subscriber intelligence, and power grid monitoring systems.',
        karaba: 'ELECTRICITY METERS',

        iraq2022Database: 'CITY REGISTRY DATABASE 2022',
        iraq2022Desc: 'CLASSIFIED: Complete citizen registry from 2022, family records, and national identification database.',
        iraq2022: 'IRAQ 2022 REGISTRY',
        selectProvince: 'SELECT PROVINCE',
        chooseProvince: '-- CHOOSE PROVINCE --',


        viewFamilyTree: 'VIEW FAMILY TREE',
        statistics: 'STATISTICS',

        exportCSV: 'EXPORT CSV',
        exportPDF: 'EXPORT PDF',

        bookmark: 'BOOKMARK',
        bookmarks: 'BOOKMARKS',
        bookmarkedRecords: 'BOOKMARKED RECORDS',
        addNote: 'Add a note to this bookmark (optional):',
        bookmarkSaved: '✓ Record bookmarked successfully!',
        bookmarkFailed: 'Failed to save bookmark',
        deleteBookmark: 'Delete this bookmark?',
        bookmarkDeleted: '✓ Bookmark deleted',
        noBookmarks: 'No bookmarks saved yet',
        note: 'Note',
        saved: 'Saved',
        delete: 'DELETE',

        familyTreeVisualization: 'FAMILY TREE VISUALIZATION',
        headOfFamily: 'HEAD OF FAMILY',
        spouse: 'SPOUSE',
        married: 'MARRIED TO',
        children: 'CHILDREN',
        otherMembers: 'OTHER MEMBERS',
        age: 'Age',
        birth: 'Birth',
        job: 'Job',
        father: 'Father',
        mother: 'Mother',

        hezakaniDatabase: 'COURT DECISIONS & PUK FORCES DATABASE',
        hezakaniDesc: 'CLASSIFIED: Court decisions, wanted persons, PUK security records, and legal case intelligence.',
        hezakani: 'COURT DECISIONS & PUK FORCES DATABASE',
        type: 'Type',
        name01: 'First Name',
        name02: 'Father Name',
        name03: 'Grandfather Name',
        name04: 'Great-Grandfather Name',
        nameCaption: 'Full Name',
        motherName: 'Mother Name',
        lNo: 'Case Number',
        lDate: 'Date',
        cases: 'Cases',
        place: 'Location',
        description: 'Description',

        shealthDatabase: 'S-HEALTH DATABASE',
shealthDesc: 'CLASSIFIED: COVID-19 vaccination records, health surveillance data, and citizen medical intelligence.',
shealth: 'S-HEALTH RECORDS',

// S-Health fields
phone: 'Phone Number',
name: 'Full Name',
title: 'Title',
identityType: 'Identity Type',
identityCardNumber: 'Identity Card Number',
residentType: 'Resident Type',
workplace: 'Workplace',
gender: 'Gender',
femaleStatus: 'Female Status',
birthDate: 'Birth Date',
province: 'Province',
district: 'District',
center: 'Vaccination Center',
centerPhone: 'Center Phone',
vaccinationStatus: 'Vaccination Status',
chronicIllnesses: 'Chronic Illnesses',
imageUrl: 'Image URL',


// After shealthDesc line
pensionDatabase: 'PENSION DATABASE',
pensionDesc: 'CLASSIFIED: Retirement records, pension beneficiaries, heir information, and financial intelligence.',
pension: 'PENSION RECORDS',

// Pension fields
puid: 'Pension ID (PUID)',
upn: 'UPN Code',
fullName: 'Full Name',
firstName: 'First Name',
secondName: 'Second Name',
thirdName: 'Third Name',
lastName: 'Last Name',
phoneNumber: 'Phone Number',
bioMetric: 'Biometric Code',
documentNumber: 'Document Number',
bank: 'Bank',
ministry: 'Ministry',
pgdOrganization: 'Organization',
pensionPlan: 'Pension Plan',
pensionStatus: 'Status',
retirementReason: 'Retirement Reason',
retirementSalary: 'Retirement Salary',
heirsCount: 'Number of Heirs',
maritalStatus: 'Marital Status',
education: 'Education',
heirFullName: 'Heir Name',
heirMotherName: 'Heir Mother Name',
heirDateOfBirth: 'Heir Birth Date',
heirGender: 'Heir Gender',
heirRelationshipType: 'Relationship',
heirPhoneNumber: 'Heir Phone',
heirAddress: 'Heir Address',
heirEligibileAmount: 'Eligible Amount',
heirIsEligible: 'Eligible',
heirIsTerminated: 'Terminated',
nationalNumber: 'National ID',
civilNumber: 'Civil ID',
processDate: 'Process Date',
        


        // Karaba fields
        accountNo: 'Account Number',
        meterSerial: 'Meter Serial',
        subscriberName: 'Subscriber Name',
        area: 'Area',
        feeder: 'Feeder',
        zone: 'Zone',
        subZone: 'Sub Zone',
        blockNo: 'Block Number',
        stsNo: 'STS Number',
        enclosureSN: 'Enclosure SN',
        meter: 'Meter',
        reading: 'Reading',
        latitude: 'Latitude',
        longitude: 'Longitude',
        status: 'Status',
        oldMeter: 'Old Meter',
        substation: 'Substation',
        comment: 'Comment',
        userName: 'User Name',
        transformerType: 'Transformer Type',
        transformerNumber: 'Transformer Number',
        pointId: 'Point ID',
        viewLocation: 'VIEW EXACT LOCATION',
        meterLocation: '▣ METER LOCATION',


        // IHEC Database
        ihecDatabase: 'ELECTORAL VOTER DATABASE',
        ihecDesc: 'TOP SECRET: Electoral voter registration, polling station data, and citizen voting intelligence.',
        ihec: 'ELECTORAL VOTERS',
        selectGovernorate: 'SELECT GOVERNORATE',
        chooseGovernorate: '-- CHOOSE GOVERNORATE --',
        
        // IHEC fields
        perId: 'Person ID',
        famNo: 'Family Number',
        firstName: 'First Name',
        fatherName: 'Father Name',
        grandName: 'Grandfather Name',
        birthYear: 'Birth Year',
        vrType: 'Voter Type',
        pcNo: 'PC Number',
        vrcId: 'VRC ID',
        govMotId: 'GOV MOT ID',
        govName: 'Governorate Name',
        pcName: 'Polling Center Name',
        pcAddress: 'PC Address',
        vrcName: 'VRC Name',
        vrcAddress: 'VRC Address',
        vrcOid: 'VRC OID',
        psNo: 'PS Number',
        voterSeq: 'Voter Sequence',
        voterCardStatus: 'Voter Card Status',
        registeredCase: 'Registered Case',
        newCardStatus: 'New Card Status',

        // FIB Database
    fibDatabase: 'FIB DATABASE',
fibDesc: 'CLASSIFIED: FIB Banking DATABASE intelligence. Discover the real names behind phone numbers.',
fib: 'FIB DATABASE',
fibSearchPhone: 'Phone Number',
fibFirstName: 'First Name',
fibLastName: 'Last Name',
fibEnglishFirstName: 'English First Name',
fibEnglishLastName: 'English Last Name',
fibDisplayName: 'Display Name',
fibPhoneNumber: 'Phone Number',
fibNoAccount: 'NO ACCOUNT FOUND',
fibNoAccountDesc: 'No FIB account exists with this phone number',
fibSearchPlaceholder: 'Enter phone number (e.g. 7512345678)...',
fibResultTitle: 'FIB NAME DATA',

        truecallerDatabase: 'PHONE DATABASE',
truecallerDesc: 'CLASSIFIED: Phone number identification, caller name lookup, and telecommunications intelligence.',
truecaller: 'PHONE LOOKUP',
truecallerName: 'Phone Name',
phoneNumber: 'Phone Number',
searchPhone: 'Phone Number',
blockedNumber: 'BLOCKED NUMBER',


lawyersDatabase: 'LAWYERS DATABASE',
lawyersDesc: 'CLASSIFIED: Kurdistan Region Bar Association records, lawyer registrations, and legal professional intelligence.',
lawyers: 'LAWYERS DATABASE',
lawyerNumber: 'Lawyer Number',
lawyerName: 'Full Name',
lawyerMobile: 'Mobile Number',
lawyerEmail: 'Email',
lawyerPermission: 'Permission Type',
lawyerUpn: 'UPN Number',
lawyerUpdateYear: 'Update Year',
        
        accessDatabase: 'ACCESS DATABASE',
        databaseAccess: 'DATABASE ACCESS',
        
        sayara: 'VEHICLE DATABASE',
        parwarda: 'PERSONNEL DATABASE',
        city: 'CITY REGISTRY',
        employees: 'EMPLOYEES',
        students: 'CITIZENS',

        // Facebook Database
        facebookDatabase: 'FACEBOOK INTELLIGENCE DATABASE',
        facebookDesc: 'Social media intelligence, user profiles, contact information, and digital footprint tracking.',
        facebook: 'FACEBOOK USERS',
        
        // Facebook fields (simplified)
        userId: 'Facebook User ID',
        phone: 'Phone Number',
        fullName: 'Full Name',
        gender: 'Gender',
        profileUrl: 'Profile URL',
        username: 'Username',
        bio: 'Bio',
        work: 'Work',
        education: 'Education',
        location: 'Location',
        hometown: 'Hometown',
        relationship: 'Relationship Status',


        // QiCard Database
        qicardDatabase: 'QI CARD DATABASE',
        qicardDesc: 'Food ration card records, QI CARD data, and citizen welfare system intelligence.',
        qicard: 'QI CARDS',
        
        // QiCard fields
        govId: 'Government ID',
        currentGovernorate: 'Current Governorate',
        currentDistrict: 'Current District',
        name: 'Full Name',
        birthPlace: 'Birth Place',
        cardNumber: 'Ration Card Number',
        issueAuthority: 'Issue Authority',
        nationality: 'Nationality',
        familyMembers: 'Family Members',
        mobile: 'Mobile Number',
        folderNumber: 'Folder Number',
        smartCardNumber: 'QI CARD Number',
        idNumber: 'ID Number',
        issueDate: 'Issue Date',
        birthDate: 'Birth Date',
        motherName: 'Mother Name',
        wifeName: 'Wife Name',
        maritalStatus: 'Marital Status',
        registryNumber: 'Registry Number',
        pageNumber: 'Page Number',
        issueOffice: 'Issue Office',
        issueGovernorate: 'Issue Governorate',

        // AsiaCell Database
        asiacellDatabase: 'ASIACELL SUBSCRIBER DATABASE',
        asiacellDesc: 'Mobile network subscriber records, SIM card registrations, and telecommunications intelligence.',
        asiacell: 'ASIACELL SUBSCRIBERS',
        
        // AsiaCell fields
        name: 'Full Name',
        phone: 'Phone Number',
        idNumber: 'ID Number',
        province: 'Province',
        status: 'Status',
        birthdate: 'Birth Date',
        contractDate: 'Contract Date',

        puidOld: 'Old Pension ID',
heirCode: 'Heir Code',
heirUpnCode: 'Heir UPN',
heirCivilId: 'Heir Civil ID',
heirNationalId: 'Heir National ID',
recordType: 'Record Type',
pensionHolder: 'PENSION HOLDER',
heirRecord: 'HEIR RECORD',
relatedHeirs: 'Related Heirs',
mainRecord: 'Main Record',


        // Relatives Finder Database
        relativesDatabase: 'RELATIVES FINDER DATABASE',
        relativesDesc: 'CLASSIFIED: Family lineage tracking, paternal and maternal relatives identification system.',
        relatives: 'RELATIVES FINDER',
        
        // Relatives fields
         searchType: 'Search Type',
        fatherRelatives: 'Father\'s Side Relatives',
        motherRelatives: 'Mother\'s Side Relatives',
        
        // Father's side search fields
        personFatherFirstName: 'Person Father\'s First Name',
        personFatherFatherName: 'Person Father\'s Father Name (Grandfather)',
        personFatherGrandfatherName: 'Person Father\'s Grandfather Name (Great-Grandfather)',
        personFatherMotherName: 'Person Father\'s Mother Name (Grandmother)',
        personFatherMotherFatherName: 'Person Father\'s Grandmother\'s Father Name',

        // Mother's side search fields
        personMotherFirstName: 'Person Mother\'s First Name',
        personMotherFatherName: 'Person Mother\'s Father Name',
        personMotherGrandfatherName: 'Person Mother\'s Grandfather Name (Great-Grandfather)',
        personMotherMotherName: 'Person Mother\'s Mother Name (Grandmother)',
        personMotherMotherFatherName: 'Person Mother\'s Grandmother\'s Father Name',
        relativesFound: 'Relatives Found',
        relationship: 'Relationship',
        paternalUncleAunt: 'Paternal Uncle/Aunt',
        maternalUncleAunt: 'Maternal Uncle/Aunt',
        kurdistanOnly: 'Kurdistan Region Only (Erbil, Duhok, Kirkuk, Sulaymaniyah)',
        
        // Vehicle fields
        autoNo: 'Vehicle ID',
        Model: 'Car Model',
        regName: 'Registration Name',
        mobile: 'Mobile Number',
        annualNo: 'Annual Number',
        shassy: 'Chassis Number',
        Makee: 'Make',
        Color: 'Color',
        CarType: 'Car Type',
        Gear: 'Gear',
        Auto_Type: 'Vehicle Type',
        year: 'Year',
        engine_no: 'Engine No',
        weight: 'Weight',
        seats: 'Seats',
        ownerAddress: 'Owner Address',
address2: 'Secondary Address',
        
        // Personnel fields
        code: 'Personnel Code',
        firstName: 'First Name',
        secondName: 'Second Name',
        thirdName: 'Third Name',
        fourthName: 'Fourth Name',
        fatherName: 'Father Name',
        fullName: 'Full Name',
        motherName: 'Mother Name',
        phone: 'Phone Number',
        studentCarerPhone: 'Guardian Phone',
        birthYear: 'Birth Year',
        studentId: 'Citizen ID',
        
        // City registry fields
        rc_no: 'RC Number',
        fam_no: 'Family Number',
        seq_no: 'Sequence Number',
        p_first: 'First Name',
        p_father: 'Father Name',
        p_grand: 'Grandfather',
        p_mother: 'Mother Name',
        gr_mother: 'Grandmother',
        p_birth: 'Birth Year',
        ss_id_no: 'ID Number',
        p_job: 'Occupation',
        
        // UI Labels
        selectZone: 'SELECT OPERATIONAL ZONE',
        selectCategory: 'TARGET CATEGORY',
        selectType: 'SELECT TYPE',
        chooseCity: '-- CHOOSE CITY ZONE --',
        chooseType: '-- SELECT TYPE --',
        
        // Buttons
        clearFields: 'CLEAR ALL FIELDS',
        terminateSession: 'TERMINATE SESSION',
        executeSearch: 'EXECUTE SEARCH',
        newSearch: 'NEW SEARCH',
        searchRecords: 'EXECUTE SEARCH',
        
        // Results
        totalRecords: 'TOTAL RECORDS FOUND',
        pageOf: 'PAGE',
        of: 'OF',
        record: 'RECORD',
        previous: 'PREVIOUS',
        next: 'NEXT',
        viewBiometric: 'VIEW BIOMETRIC IMAGE',
        viewFamily: 'VIEW FAMILY UNIT',
        
        // Modal titles
        biometricData: '▣ BIOMETRIC IMAGE DATA',
        familyRecords: '▣ FAMILY UNIT RECORDS',
        genderMale: 'Male',
genderFemale: 'Female',
        
        // Misc
        enterValue: 'Enter',
        scanningDatabases: 'SCANNING ENCRYPTED DATABASES...',
        decrypting: 'DECRYPTING RECORDS... AUTHENTICATING... PROCESSING...',
        searchResults: 'SEARCH RESULTS: CLASSIFIED',
        familyUnit: 'FAMILY UNIT NUMBER',
        totalMembers: 'TOTAL MEMBERS',
        zone: 'ZONE',
        attachmentId: 'ATTACHMENT ID',
        status: 'STATUS',
        decrypted: 'DECRYPTED',
        clearance: 'CLEARANCE',
        authorized: 'AUTHORIZED',
        imageNotFound: 'IMAGE DATA NOT FOUND',
        decryptionFailed: 'DECRYPTION FAILED',
        noFamilyRecords: 'NO FAMILY RECORDS FOUND',
        accessDenied: 'ACCESS DENIED',
        decryptingImage: 'DECRYPTING IMAGE DATA',
        accessingFamily: 'ACCESSING FAMILY RECORDS',
        
        // Additional fields
        resid_location: 'Residence',
        fld_address: 'Address',
        fld_organization_fullname: 'Organization',
        fld_position: 'Position',
        fld_department: 'Department',
        fld_salary: 'Salary',
        p_relation: 'Relation',
        ss_br_no: 'Birth Record',
        ss_lg_no: 'Ledger No',
        ss_pg_no: 'Page No',
        p_case: 'Case Status',
        p_work: 'Workplace',
        t_job: 'Job Type',
        mark: 'Notes',
        soc: 'Social Status',
        Grade: 'Grade',
        Class: 'Class',
        Address: 'Address',
        School: 'City or School/Institute',
        table_name: 'Category'
    },
    ku: {
        // UI elements
        titleofsys : 'سیستەمی چاوی دەوڵەت',
        language: 'KU',
        systemActive: 'سیستەم چالاکە',
        connection: 'پەیوەندی',
        secure: 'پارێزراو',
        clearanceLabel: 'ئاستی دەسەڵات',
        adminAccess: 'بەڕێوەبردن',
        disconnect: 'دەرچوون',

        homeNav: 'ناوەندی فەرماندەیی',
        databasesNav: 'مۆدیولەکانی زیرەکی',
        navOverview: 'گشتی',
        crumbRoot: 'BCIA',
        cmdkTrigger: 'گەڕان بۆ مۆدیولەکان…',
        homeWelcome: 'بەخێربێیتەوە',
        homeSub: 'تێڕوانینی ڕاستەوخۆی فەزای زیرەکیت',
        kpiDatabasesLabel: 'مۆدیولە بەردەستەکان',
        kpiSearchesLabel: 'گەڕانە ئەنجامدراوەکان',
        kpiBookmarksLabel: 'ئێنتیتییە نیشانکراوەکان',
        kpiClearanceLabel: 'ئاستی دەسەڵات',
        searchActivityTitle: 'چالاکی گەڕان',
        searchActivitySub: 'کۆتا 7 ڕۆژ',
        recentActivityTitle: 'تێمی چالاکی ڕاستەوخۆ',
        quickAccessTitle: 'دەستگەیشتنی خێرا',
        coreRegistriesGroup: 'تۆمارە سەرەکییەکان',
        telecomServicesGroup: 'پەیوەندی و OSINT',
        peopleRelationsGroup: 'زیرەکی پەیوەندی',
        intelligenceToolsGroup: 'ئامرازی هەڕەشە و ئۆپەراتۆر',
        fibLockedBtn: 'کاتیانە داخراوە',
        cmdkNoResults: 'هیچ ئەنجامێک نەدۆزرایەوە',
        cmdkActionsGroup: 'کردارەکان',
        cmdkModulesGroup: 'مۆدیولەکان',
        cmdkActionHome: 'بڕۆ بۆ ناوەندی فەرماندەیی',
        cmdkActionDatabases: 'بڕۆ بۆ مۆدیولەکانی زیرەکی',
        cmdkActionProfile: 'کردنەوەی پرۆفایل',
        cmdkActionLogout: 'کۆتایی هێنان بە دانیشتن',

        profile: 'پرۆفایل',
    userProfile: 'پرۆفایلی ئەجێنت',
    searchHistory: 'مێژووی گەڕان',
    changePassword: 'گۆڕینی وشەی نهێنی',
    oldPassword: 'وشەی نهێنی کۆن',
    newPassword: 'وشەی نهێنی نوێ',
    confirmNewPassword: 'دڵنیاکردنەوەی وشەی نهێنی نوێ',
    passwordChanged: '✓ وشەی نهێنی بە سەرکەوتوویی گۆڕدرا',
    passwordChangeFailed: '⚠️ گۆڕینی وشەی نهێنی سەرکەوتوو نەبوو',
    searchedOn: 'گەڕانکراو لە',
    noSearchHistory: 'هیچ مێژووی گەڕانێک نییە',
    clearHistory: 'پاککردنەوەی مێژوو',
        
        // Database titles
        vehicleDatabase: 'بنکەی زانیاری ئۆتۆمبێل',
        personnelDatabase: 'بنکەی زانیاری کەسان',
        cityDatabase: 'بنکەی تۆمارکردنی شار',
        
        // Database descriptions
        vehicleDesc: 'نهێنی: تۆمارەکانی تۆماری ئۆتۆمبێل، زانیاری هەوڵی ئۆتۆمبێل، و سیستەمی چاودێری گواستنەوە.',
        personnelDesc: 'زۆر نهێنی: پەڕگەکانی کارمەندان، تۆمارەکانی کار، و زانیاری هاوڵاتیان.',
        cityDesc: 'سنووردار: تۆمارەکانی خێزان، زانیاری نیشتەجێبوون، و زانیاری ناسنامەی هاوڵاتیان.',


        karabaDatabase: 'بنکەی زانیاری کارەبا',
        karabaDesc: 'نهێنی: چاودێری میتەری کارەبا، زانیاری بەشداربووان، و سیستەمی چاودێری تۆڕی کارەبا.',
        karaba: 'میتەری کارەبا',

        viewFamilyTree: 'بینینی گرافیکی خێزان',
        statistics: 'ئاماری',


        cveDatabase: 'بنکەی زانیاری CVE',
cveDesc: 'نهێنی: کەلێنەکانی دوایین کات، شوێنکەوتنی گرنگی، گەڕانی CVE، و زانیاری بهرەمهێنانی کەلێن.',
cveAccess: 'دەستگەیشتن بە بنکەی CVE',
cveReady: 'بنکەی CVE ئامادەیە',
cveReadyDesc: 'کرتە لە دوایین بکە بۆ بارکردنی CVE کانی نوێ یان گەڕان بە ناوی CVE',
cveTotal: 'کۆی تۆمارەکان',
cveNotFound: 'هیچ تۆماری CVE نەدۆزرایەوە',
cveConnFailed: '⚠ پەیوەندی سەرکەوتوو نەبوو',
cveRetry: '↺ دووبارە هەوڵبدەرەوە',
cveLatest: '↺ دوایین',
cveSearch: 'گەڕان',
cveSearchPlaceholder: 'گەڕان بە ناوی CVE (بۆ نموونە CVE-2024-1234)...',
cveAllSeverities: 'هەموو ئاستەکان',
cveSource: 'سەرچاوە: NVD / NIST — فیدی ڕاستەوخۆ',
cveScanning: 'سکانکردنی بنکەی CVE...',
cveDecrypting: 'پەیوەندی بە NVD — کردنەوەی شفرەی تۆمارەکان...',
cvePublished: 'بڵاوکراوەتەوە',
cveModified: 'دوایین گۆڕانکاری',
cveCwe: 'CWE',
cveVector: 'ڤێکتۆر',
cveReferences: 'سەرچاوەکان',
cveScore: 'نمرەی CVSS',

peshmergaDatabase: 'پێشمەرگە پاوەر',
peshmergaDesc: 'نهێنی: گەڕانی بنکەی دزەپێکراوەکان، زانیاریەکانی ئامێر، و زانیاری ناسنامەی دیجیتاڵ. سنووردار بە 5 گەڕان لە 24 کاتژمێر.',
peshmergaAccess: 'بەکارهێنانی پێشمەرگە پاوەر',
peshmergaQuota: 'پێوانە',
peshmergaBreachSearch: 'گەڕانی دزەپێکراو',
peshmergaStealerinformations: 'زانیاریەکانی ئامێر',
peshmergaVictimSearch: 'گەڕانی قوربانی',
peshmergaHintBreach: 'دزەپێکراو: گەڕان بە ئیمەیڵ — دۆزینەوەی ناسنامە لە دزەپێکراوەکانی ناسراو',
peshmergaHintStealer: 'ئامێر: گەڕان بە دۆمەین یان ئیمەیڵ — داتای زانیاریەکانی ئامێر',
peshmergaHintVictim: 'قوربانی: گەڕانی ئەکاونتە بڕاوەکان و پرۆفایلی قوربانیان',
peshmergaPlaceholderBreach: 'ئیمەیڵ بنووسە (بۆ نموونە user@example.com)...',
peshmergaPlaceholderStealer: 'دۆمەین یان ئیمەیڵ بنووسە (بۆ نموونە example.com)...',
peshmergaPlaceholderVictim: 'ناوی بەکارهێنەر، ئیمەیڵ، یان کلیلەوشە بنووسە...',
peshmergaOnline: 'پێشمەرگە پاوەر سەرهێڵە',
peshmergaOnlineDesc: 'پرسیارێک داخڵ بکە بۆ گەڕان لە بنکەی زانیاری دزەپێکراو.',
peshmergaOnlineDesc2: 'هەر گەڕانێک 1 لە 5 کرێدیتی ڕۆژانەت خەرج دەکات.',
peshmergaNoResults: 'هیچ تۆماریک نەدۆزرایەوە',
peshmergaNoResultsDesc: 'هیچ داتایەکی دزەپێکراو نەدۆزرایەوە بۆ',
peshmergaQuotaWarning: 'هەر گەڕانێک 1 کرێدیتی ڕۆژانە خەرج دەکات (5 لە 24 کاتژمێر)',
peshmergaDailyLimit: 'سنووری ڕۆژانە گەیشتراوە',
peshmergaUpgrade: 'پەیوەندی بە بەڕێوەبەر بکە',
        
        // Karaba fields
        accountNo: 'ژمارەی ئەکاونت',
        meterSerial: 'ژمارەی میتەر',
        subscriberName: 'ناوی بەشداربوو',
        area: 'ناوچە',
        feeder: 'فیدەر',
        zone: 'زۆن',
        subZone: 'ژێر زۆن',
        blockNo: 'ژمارەی بلۆک',
        stsNo: 'ژمارەی STS',
        enclosureSN: 'ژمارەی Enclosure',
        meter: 'میتەر',
        reading: 'خوێندنەوە',
        latitude: 'هێڵی پانی',
        longitude: 'هێڵی درێژی',
        status: 'دۆخ',
        oldMeter: 'میتەری کۆن',
        substation: 'وێستگەی لاوەکی',
        comment: 'تێبینی',
        userName: 'ناوی بەکارهێنەر',
        transformerType: 'جۆری ترانسفۆرمەر',
        transformerNumber: 'ژمارەی ترانسفۆرمەر',
        pointId: 'ژمارەی خاڵ',
        viewLocation: 'بینینی شوێنی وردبینانە',
        meterLocation: '▣ شوێنی میتەر',

puidOld: 'ژمارەی کۆنی خانەنشینی',
heirCode: 'کۆدی میراتگر',
heirUpnCode: 'کۆدی UPN ی میراتگر',
heirCivilId: 'ناسنامەی مەدەنی میراتگر',
heirNationalId: 'ناسنامەی نیشتمانی میراتگر',
recordType: 'جۆری تۆمار',
pensionHolder: 'خاوەنی خانەنشینی',
heirRecord: 'تۆماری میراتگر',
relatedHeirs: 'میراتگرە پەیوەستەکان',
mainRecord: 'تۆماری سەرەکی',

        // IHEC Database
        ihecDatabase: 'بنکەی زانیاری دەنگدەران',
        ihecDesc: 'زۆر نهێنی: تۆمارکردنی دەنگدەران، زانیاری وێستگەکانی دەنگدان، و زانیاری دەنگدانی هاوڵاتیان.',
        ihec: 'دەنگدەران',
        selectGovernorate: 'هەڵبژاردنی پارێزگا',
        chooseGovernorate: '-- هەڵبژاردنی پارێزگا --',

        aiDatabase: 'Cyb3r Drag0nz AI',
aiDesc: 'نهێنی: پەیوەندی ڕاستەوخۆ بە سیستەمی زیرەکی Cyb3r Drag0nz. یارمەتیدەری AI.',
aiAccess: 'بەکارهێنانی AI تێرمینال',
aiOnline: 'سەرهێڵ',
aiOffline: 'دەرهێڵ',
aiModel: 'مۆدێل: Cyb3r-Drag0nz:latest',
aiWelcomeTitle: 'سایبەر دراگۆنز سەرهێڵە',
aiWelcomeDesc: 'پەیوەندی دامەزراوە. هەر پرسیارێک بکە.',
aiWelcomeSubDesc: 'کارئەنجامدان لەڕێگەی زیرەکی دەستکردی تایبەت',
aiPlaceholder: 'پرسیارەکەت بنووسە...',
aiYou: '▸ تۆ',
aiDragon: '▸ سایبەر دراگۆنز',
aiSystem: '▸ سیستەم',
aiClear: 'پاک',
aiSend: '►',
aiOfflineMsg: '⚠ ئەی ئای دەرهێڵە\n\nدڵنیابە کاردەکات لەسەر سێرڤەر',
aiShortcut: 'ENTER بۆ نێردن • SHIFT+ENTER بۆ هێڵی نوێ',
        
        // IHEC fields
        perId: 'ژمارەی کەسی',
        famNo: 'ژمارەی خێزان',
        firstName: 'ناوی یەکەم',
        fatherName: 'ناوی باوک',
        grandName: 'ناوی باپیر',
        birthYear: 'ساڵی لەدایکبوون',
        vrType: 'جۆری دەنگدەر',
        pcNo: 'ژمارەی PC',
        vrcId: 'ژمارەی VRC',
        govMotId: 'ژمارەی GOV MOT',
        govName: 'ناوی پارێزگا',
        pcName: 'ناوی سەنتەری دەنگدان',
        pcAddress: 'ناونیشانی PC',
        vrcName: 'ناوی VRC',
        vrcAddress: 'ناونیشانی VRC',
        vrcOid: 'VRC OID',
        psNo: 'ژمارەی PS',
        voterSeq: 'زنجیرەی دەنگدەر',
        voterCardStatus: 'دۆخی کارتی دەنگدەر',
        registeredCase: 'دۆخی تۆمارکراو',
        newCardStatus: 'دۆخی کارتی نوێ',
        
        accessDatabase: 'دەستگەیشتن بە بنکەی زانیاری',
        databaseAccess: 'دەستگەیشتن بە بنکەی زانیاری',
        
        sayara: 'بنکەی زانیاری ئۆتۆمبێل',
        parwarda: 'بنکەی زانیاری کەسان',
        city: 'تۆمارکردنی شار',
        employees: 'کارمەندان',
        students: 'هاوڵاتیان',


        familyTreeVisualization: 'گرافیکی خێزان',
        headOfFamily: 'سەرۆکی خێزان',
        spouse: 'هاوسەر',
        married: 'هاوسەرگیری بە',
        children: 'منداڵان',
        otherMembers: 'ئەندامانی تر',
        age: 'تەمەن',
        birth: 'لەدایکبوون',
        job: 'کار',
        father: 'باوک',
        mother: 'دایک',

        hezakaniDatabase: 'بڕیارەکانی دادگا و هێزەکانی یەکێتی',
        hezakaniDesc: 'نهێنی: بڕیارەکانی دادگا، کەسە داواکراوەکان، تۆمارەکانی هێزەکانی یەکێتی، و زانیاری کەیسە یاساییەکان.',
        hezakani: 'بڕیارەکانی دادگا و هێزەکانی یەکێتی',

        type: 'جۆر',
        name01: 'ناوی یەکەم',
        name02: 'ناوی باوک',
        name03: 'ناوی باپیر',
        name04: 'ناوی دایک باپیر',
        nameCaption: 'ناوی تەواو',
        motherName: 'ناوی دایک',
        lNo: 'ژمارەی کەیس',
        lDate: 'بەروار',
        cases: 'کەیسەکان',
        place: 'شوێن',
        description: 'وەسف',


        shealthDatabase: 'بنکەی زانیاری تەندروستی',
shealthDesc: 'نهێنی: تۆمارەکانی کوتانی کۆڤید-19، چاودێری تەندروستی، و زانیاری پزیشکی هاوڵاتیان.',
shealth: 'تۆمارەکانی تەندروستی',

// FIB Database
        fibDatabase: 'بنکەی زانیاری FIB',
fibDesc: 'نهێنی: گەڕانی ناوی ڕاستەقینەی خاوەنی ژمارەکان لە ڕێگەی FIB Banking',
fib: 'گەڕانی FIB',
fibSearchPhone: 'ژمارەی تەلەفۆن',
fibFirstName: 'ناوی یەکەم',
fibLastName: 'ناوی کۆتایی',
fibEnglishFirstName: 'ناوی یەکەم (ئینگلیزی)',
fibEnglishLastName: 'ناوی کۆتایی (ئینگلیزی)',
fibDisplayName: 'ناوی تەواو',
fibPhoneNumber: 'ژمارەی تەلەفۆن',
fibNoAccount: 'هیچ ئەکاونتێک نەدۆزرایەوە',
fibNoAccountDesc: 'هیچ ئەکاونتێکی FIB بەم ژمارەیە نەدۆزرایەوە',

        truecallerDatabase: 'بنکەی زانیاری ژمارەی مۆبایل',
truecallerDesc: 'نهێنی: ناسینەوەی ژمارەی تەلەفۆن، گەڕانی ناوی بانگکەر، و زانیاری پەیوەندیەکان .',
truecaller: 'گەڕانی ژمارەی مۆبایل',

truecallerDatabase: 'بنکەی زانیاری ژمارەی مۆبایل',
truecallerDesc: 'نهێنی: ناسینەوەی ژمارەی تەلەفۆن، گەڕانی ناوی بانگکەر، و زانیاری پەیوەندیەکان .',
truecaller: 'گەڕانی ژمارەی مۆبایل',
truecallerName: 'ناوی ژمارەی مۆبایل',
phoneNumber: 'ژمارەی تەلەفۆن',
searchPhone: 'ژمارەی تەلەفۆن',
blockedNumber: 'ژمارە بلۆککراوە',


lawyersDatabase: 'بنکەی زانیاری پارێزەران',
lawyersDesc: 'نهێنی: تۆمارەکانی بارەی پارێزەرانی هەرێمی کوردستان و زانیاری پیشەیی یاسایی.',
lawyers: 'بنکەی زانیاری پارێزەران',
lawyerNumber: 'ژمارەی پارێزەر',
lawyerName: 'ناوی تەواو',
lawyerMobile: 'ژمارەی مۆبایل',
lawyerEmail: 'ئیمەیڵ',
lawyerPermission: 'جۆری مۆڵەت',
lawyerUpn: 'ژمارەی UPN',
lawyerUpdateYear: 'ساڵی نوێکردنەوە',

shadDatabase: 'هاکی کامێرا',
shadDesc: 'نهێنی: سێرڤەرەکانی تۆڕی کامێرا هاک بۆ دروستکردنی لاپەڕەی زیرەکی پارێزراو.',
shadSelectBot: 'هەڵبژاردنی سێرڤەری هاکی کامێرا (Username: shad, Password: shad)',
shadSelectBotDesc: 'هەڵبژێرە کام سێرڤەری تۆڕی کامێرا هاک چالاک بکەیت',
shadActivate: 'چالاککردنی سێرڤەر',
shadTitleStep: 'ناونیشانی لاپەڕە بنووسە',
shadTitleDesc: 'سێرڤەر ئامادەیە. ناونیشانی لاپەڕەی زیرەکی بنووسە.',
shadTitleLabel: 'ناونیشانی لاپەڕە',
shadTitlePlaceholder: 'ناونیشان بنووسە...',
shadSendTitle: 'ناونیشان بنێرە',
shadOgStep: 'وێنەی OG بارکە',
shadOgDesc: 'وێنەی OG (پێشبینی) بۆ لاپەڕەکە بارکە.',
shadUploadOg: 'کرتە بکە بۆ بارکردنی وێنەی OG',
shadSendOg: 'وێنەی OG بنێرە',
shadBgStep: 'وێنەی باکگراوند بارکە',
shadBgDesc: 'وێنەی باکگراون لاپەڕەکە بارکە.',
shadUploadBg: 'کرتە بکە بۆ بارکردنی وێنەی باکگراوند',
shadSendBg: 'وێنەی باکگراوند بنێرە',
shadComplete: 'لاپەڕەی هاکی کامێرا دروستکرا',
shadShareLink: 'لینکی ناردن بۆ نێچیر',
shadResultLink: 'لینکی ئەنجامەکان',
shadNewSession: 'دانیشتنی نوێ',
shadClose: 'داخستن',
shadConnecting: 'پەیوەندی بە سێرڤەر...',
shadSending: 'ناونیشان دەنێردرێت...',
shadSendingImage: 'وێنە دەنێردرێت...',
shadWait: 'چاوەڕێ بکە بۆ وەڵامی سێرڤەر...',

// S-Health fields
phone: 'ژمارەی تەلەفۆن',
name: 'ناوی تەواو',
title: 'ناونیشان',
identityType: 'جۆری ناسنامە',
identityCardNumber: 'ژمارەی ناسنامە',
residentType: 'جۆری نیشتەجێبوون',
workplace: 'شوێنی کار',
gender: 'ڕەگەز',
femaleStatus: 'دۆخی ژنان',
birthDate: 'بەرواری لەدایکبوون',
province: 'پارێزگا',
district: 'قەزا',
center: 'سەنتەری کوتان',
centerPhone: 'تەلەفۆنی سەنتەر',
vaccinationStatus: 'دۆخی کوتان',
chronicIllnesses: 'نەخۆشی درێژخایەن',
imageUrl: 'بەستەری وێنە',



// After shealthDesc line
pensionDatabase: 'بنکەی زانیاری خانەنشینی',
pensionDesc: 'نهێنی: تۆمارەکانی خانەنشینی، سوودمەندان، زانیاری میراتگران، و زانیاری دارایی.',
pension: 'تۆمارەکانی خانەنشینی',

// Pension fields
puid: 'ژمارەی خانەنشینی (PUID)',
upn: 'کۆدی UPN',
fullName: 'ناوی تەواو',
firstName: 'ناوی یەکەم',
secondName: 'ناوی دووەم',
thirdName: 'ناوی سێیەم',
lastName: 'ناوی کۆتایی',
phoneNumber: 'ژمارەی تەلەفۆن',
bioMetric: 'کۆدی بایۆمێتریک',
documentNumber: 'ژمارەی بەڵگەنامە',
bank: 'بانک',
ministry: 'وەزارەت',
pgdOrganization: 'ڕێکخراو',
pensionPlan: 'پلانی خانەنشینی',
pensionStatus: 'دۆخ',
retirementReason: 'هۆکاری خانەنشینی',
retirementSalary: 'موچەی خانەنشینی',
heirsCount: 'ژمارەی میراتگران',
maritalStatus: 'دۆخی خێزانی',
education: 'خوێندن',
heirFullName: 'ناوی میراتگر',
heirMotherName: 'ناوی دایکی میراتگر',
heirDateOfBirth: 'بەرواری لەدایکبوونی میراتگر',
heirGender: 'ڕەگەزی میراتگر',
heirRelationshipType: 'پەیوەندی',
heirPhoneNumber: 'تەلەفۆنی میراتگر',
heirAddress: 'ناونیشانی میراتگر',
heirEligibileAmount: 'بڕی مافداری',
heirIsEligible: 'مافدار',
heirIsTerminated: 'کۆتایی هاتووە',
nationalNumber: 'ژمارەی نیشتمانی',
civilNumber: 'ژمارەی مەدەنی',
processDate: 'بەرواری پرۆسێس',

gender: 'ڕەگەز',

School: 'شار یان قوتابخانە و پەیمانگە',


        // Facebook Database
        facebookDatabase: 'بنکەی زانیاری فەیسبووک',
        facebookDesc: 'زانیاری تۆڕە کۆمەڵایەتییەکان، پرۆفایلی بەکارهێنەران، زانیاری پەیوەندی، و شوێنپێی دیجیتاڵ.',
        facebook: 'بەکارهێنەرانی فەیسبووک',
        
        // Facebook fields
        userId: 'ژمارەی بەکارهێنەر',
        phone: 'ژمارەی تەلەفۆن',
        fullName: 'ناوی تەواو',
        gender: 'ڕەگەز',
        profileUrl: 'بەستەری پرۆفایل',
        username: 'ناوی بەکارهێنەر',
        bio: 'وەسف',
        work: 'کار',
        education: 'خوێندن',
        location: 'شوێن',
        hometown: 'شاری لەدایکبوون',
        relationship: 'دۆخی پەیوەندی',

        // QiCard Database
        qicardDatabase: 'بنکەی زانیاری کی کارد',
        qicardDesc: 'تۆمارەکانی کارتی تەونبەندی، زانیاری کی کارد، و سیستەمی چاودێری خزمەتگوزاری هاوڵاتیان.',
        qicard: 'کی کارد',
        
        // QiCard fields
        govId: 'ژمارەی حکومی',
        currentGovernorate: 'پارێزگای ئێستا',
        currentDistrict: 'قەزای ئێستا',
        name: 'ناوی تەواو',
        birthPlace: 'شوێنی لەدایکبوون',
        cardNumber: 'ژمارەی کارتی تەونبەندی',
        issueAuthority: 'دەسەڵاتی دەرکردن',
        nationality: 'نەتەوە',
        familyMembers: 'ژمارەی ئەندامان',
        mobile: 'ژمارەی مۆبایل',
        folderNumber: 'ژمارەی فۆڵدەر',
        smartCardNumber: 'ژمارەی کی کارد',
        idNumber: 'ژمارەی ناسنامە',
        issueDate: 'بەرواری دەرکردن',
        birthDate: 'بەرواری لەدایکبوون',
        motherName: 'ناوی دایک',
        wifeName: 'ناوی ژن',
        maritalStatus: 'دۆخی خێزانی',
        registryNumber: 'ژمارەی تۆمار',
        pageNumber: 'ژمارەی لاپەڕە',
        issueOffice: 'ئۆفیسی دەرکردن',
        issueGovernorate: 'پارێزگای دەرکردن',

        // AsiaCell Database
        asiacellDatabase: 'بنکەی زانیاری ئاسیاسێڵ',
        asiacellDesc: 'تۆمارەکانی بەشداربووانی تۆڕی مۆبایل، تۆمارکردنی سیمکارت، و زانیاری پەیوەندیەکان.',
        asiacell: 'بەشداربووانی ئاسیاسێڵ',
        
        // AsiaCell fields
        name: 'ناوی تەواو',
        phone: 'ژمارەی تەلەفۆن',
        idNumber: 'ژمارەی ناسنامە',
        province: 'پارێزگا',
        status: 'دۆخ',
        birthdate: 'بەرواری لەدایکبوون',
        contractDate: 'بەرواری گرێبەست',

        // Relatives Finder Database
        relativesDatabase: 'بنکەی زانیاری خزمایەتی',
        relativesDesc: 'نهێنی: سیستەمی شوێنکەوتنی ڕەچەڵەکی خێزان، ناسینەوەی خزمەکانی لایەنی باوک و دایک.',
        relatives: 'دۆزینەوەی خزمەکان',
        
        // Relatives fields
        searchType: 'جۆری گەڕان',
        fatherRelatives: 'خزمەکانی لایەنی باوک',
        motherRelatives: 'خزمەکانی لایەنی دایک',
        
        // Father's side search fields
        personFatherFirstName: 'ناوی یەکەمی باوکی کەس',
        personFatherFatherName: 'ناوی باوکی باوکی کەس (باپیر)',
        personFatherGrandfatherName: 'ناوی باپیری باوکی کەس (دایک باپیر)',
        personFatherMotherName: 'ناوی دایکی باوکی کەس (دایەپیر)',
        personFatherMotherFatherName: 'ناوی باوکی دایەپیری باوکی کەس',
        
        // Mother's side search fields
        personMotherFirstName: 'ناوی یەکەمی دایکی کەس',
        personMotherFatherName: 'ناوی باوکی دایکی کەس',
        personMotherGrandfatherName: 'ناوی باپیری دایکی کەس (دایک باپیر)',
        personMotherMotherName: 'ناوی دایکی دایکی کەس (دایەپیر)',
        personMotherMotherFatherName: 'ناوی باوکی دایەپیری کەس',
        relativesFound: 'خزمەکانی دۆزراوە',
        relationship: 'پەیوەندی',
        paternalUncleAunt: 'مام/پورزا',
        maternalUncleAunt: 'خاڵ/خاتوو',
        kurdistanOnly: 'تەنها هەرێمی کوردستان (هەولێر، دهۆک، کەرکوک، سلێمانی)',
        
        // Vehicle fields
        autoNo: 'ژمارەی تابلۆ',
        Model: 'مۆدێلی ئۆتۆمبێل',
        regName: 'ناوی شوفێر',
        mobile: 'ژمارەی مۆبایل',
        annualNo: 'ژمارەی ساڵانە',
        shassy: 'ژمارەی شاسی',
        Makee: 'وەرگر',
        Color: 'ڕەنگ',
        CarType: 'جۆری ئۆتۆمبێل',
        Gear: 'گێر',
        Auto_Type: 'جۆری ئۆتۆمبێل',
        year: 'ساڵ',
        engine_no: 'ژمارەی مەکینە',
        weight: 'کێش',
        seats: 'ژمارەی کورسی',

        genderMale: 'نێر',
genderFemale: 'مێ',

        ownerAddress: 'ناونیشانی خاوەن',
address2: 'ناونیشانی دووەم',
        
        // Personnel fields
        code: 'کۆدی کەسی',
        firstName: 'ناوی یەکەم',
        secondName: 'ناوی دووەم',
        thirdName: 'ناوی سێیەم',
        fourthName: 'ناوی چوارەم',
        fatherName: 'ناوی باوک',
        fullName: 'ناوی تەواو',
        motherName: 'ناوی دایک',
        phone: 'ژمارەی تەلەفۆن',
        studentCarerPhone: 'ژمارەی سەرپەرشتیار',
        birthYear: 'ساڵی لەدایکبوون',
        studentId: 'ژمارەی ناسنامە',
        
        // City registry fields
        rc_no: 'ژمارەی RC',
        fam_no: 'ژمارەی خێزان',
        seq_no: 'ژمارەی زنجیرە',
        p_first: 'ناوی یەکەم',
        p_father: 'ناوی باوک',
        p_grand: 'باپیر',
        p_mother: 'ناوی دایک',
        gr_mother: 'دایەپیر',
        p_birth: 'ساڵی لەدایکبوون',
        ss_id_no: 'ژمارەی ناسنامە',
        p_job: 'پیشە',

        iraq2022Database: 'بنکەی تۆمارکردنی شار 2022',
        iraq2022Desc: 'نهێنی: تۆماری تەواوی هاوڵاتیان لە ساڵی 2022، تۆمارەکانی خێزان، و بنکەی زانیاری ناسنامەی نیشتمانی.',
        iraq2022: 'تۆمارکردنی عێراق 2022',
        selectProvince: 'هەڵبژاردنی پارێزگا',
        chooseProvince: '-- هەڵبژاردنی پارێزگا --',

        exportCSV: 'داگرتنی CSV',
        exportPDF: 'داگرتنی PDF',

        bookmark: 'نیشانەکردن',
        bookmarks: 'نیشانەکراوەکان',
        bookmarkedRecords: 'تۆمارە نیشانەکراوەکان',
        addNote: 'تێبینی بۆ ئەم نیشانەیە زیاد بکە (ئیختیاری):',
        bookmarkSaved: '✓ تۆمار بە سەرکەوتوویی نیشانەکرا!',
        bookmarkFailed: 'نیشانەکردن سەرکەوتوو نەبوو',
        deleteBookmark: 'ئەم نیشانەیە بسڕیتەوە؟',
        bookmarkDeleted: '✓ نیشانە سڕایەوە',
        noBookmarks: 'هیچ نیشانەیەک تۆمار نەکراوە',
        note: 'تێبینی',
        saved: 'تۆمارکراو',
        delete: 'سڕینەوە',


        // UI Labels
        selectZone: 'هەڵبژاردنی ناوچە',
        selectCategory: 'هەڵبژاردنی جۆر',
        selectType: 'هەڵبژاردنی جۆر',
        chooseCity: '-- هەڵبژاردنی شار --',
        chooseType: '-- هەڵبژاردنی جۆر --',
        
        // Buttons
        clearFields: 'پاککردنەوەی هەموو خانەکان',
        terminateSession: 'کۆتایی دانیشتن',
        executeSearch: 'جێبەجێکردنی گەڕان',
        newSearch: 'گەڕانی نوێ',
        searchRecords: 'جێبەجێکردنی گەڕان',
        
        // Results
        totalRecords: 'کۆی تۆمارەکانی دۆزراوە',
        pageOf: 'لاپەڕە',
        of: 'لە',
        record: 'تۆمار',
        previous: 'پێشوو',
        next: 'دواتر',
        viewBiometric: 'بینینی وێنەی بایۆمێتریک',
        viewFamily: 'بینینی تۆماری خێزان',
        
        // Modal titles
        biometricData: '▣ زانیاری وێنەی بایۆمێتریک',
        familyRecords: '▣ تۆمارەکانی یەکەی خێزان',
        
        // Misc
        enterValue: 'نووسین',
        scanningDatabases: 'سکان کردنی بنکە شفرەکراوەکان...',
        decrypting: 'کردنەوەی شفرە... دڵنیاکردنەوە... پرۆسێسکردن...',
        searchResults: 'ئەنجامەکانی گەڕان: نهێنی',
        familyUnit: 'ژمارەی یەکەی خێزان',
        totalMembers: 'کۆی ئەندامان',
        zone: 'ناوچە',
        attachmentId: 'ژمارەی پاشکۆ',
        status: 'دۆخ',
        decrypted: 'شفرەکراوە',
        clearance: 'ڕێگەپێدراو',
        authorized: 'مۆڵەتدار',
        imageNotFound: 'زانیاری وێنە نەدۆزرایەوە',
        decryptionFailed: 'کردنەوەی شفرە سەرکەوتوو نەبوو',
        noFamilyRecords: 'تۆماری خێزان نەدۆزرایەوە',
        accessDenied: 'دەستگەیشتن ڕەتکرایەوە',
        decryptingImage: 'کردنەوەی شفرەی زانیاری وێنە',
        accessingFamily: 'دەستگەیشتن بە تۆمارەکانی خێزان',
        
        // Additional fields
        resid_location: 'شوێنی نیشتەجێبوون',
        fld_address: 'ناونیشان',
        fld_organization_fullname: 'ڕێکخراو',
        fld_position: 'پێگە',
        fld_department: 'بەش',
        fld_salary: 'موچە',
        p_relation: 'پەیوەندی',
        ss_br_no: 'تۆماری لەدایکبوون',
        ss_lg_no: 'ژمارەی دەفتەر',
        ss_pg_no: 'ژمارەی لاپەڕە',
        p_case: 'دۆخی کێشە',
        p_work: 'شوێنی کار',
        t_job: 'جۆری کار',
        mark: 'تێبینی',
        soc: 'دۆخی کۆمەڵایەتی',
        Grade: 'پلە',
        Class: 'پۆل',
        Address: 'ناونیشان',
        School: 'شار یان قوتابخانە و پەیمانگە',
        table_name: 'جۆر'
    }
};

const cities = {
    "هەولێر": "Erbil", "سلێمانی": "Sulaymaniyah", "بەغداد": "Baghdad",
    "دهۆک": "Duhok", "کەرکوک": "Kirkuk", "موسڵ": "Mosul",
    "ئەنبار": "Alanbar", "بابل": "Babylon", "بەسرە": "Basrah",
    "زی قار": "Dhi Qar", "میسان": "Mesan", "موسەنا": "Muthana",
    "قادیسیە": "Qadisiya", "سەلاحەدین": "Salahaldeen", "نەجەف": "Najaf"
};

const iraq2022Provinces = {
    "ئەنبار": "Anbar",
    "بابل": "Babel",
    "بەغداد - مەشتەڵ": "Baghdad - Mashtal",
    "بەغداد - محمد": "Baghdad - Muhamed",
    "بەغداد - مەتنەبی": "Baghdad - Mutanabi",
    "بەغداد - رسافە": "Baghdad - Risafa",
    "بەغداد - سەدر": "Baghdad - Sadir",
    "بەغداد - سەید شوهەدا": "Baghdad - Said Shuhada",
    "بەغداد - شەعب": "Baghdad - Shaab",
    "بەلەد": "Balad",
    "بەسرە": "Basrah",
    "زی قار": "Dhi Qar",
    "دیالە": "Diyala",
    "دهۆک": "Duhok",
    "هەولێر": "Erbil",
    "کەربەلا": "Karbala",
    "کەرکوک": "Kirkuk",
    "میسان": "Misan",
    "موسەنا": "Muthana",
    "نەینەوا": "Nainawa",
    "نەجەف": "Najaf",
    "سەلاحەدین": "Salahaldeen",
    "سلێمانی": "Sulaymaniyah",
    "واسیت": "Wasit",
    "قادیسیە": "Qadisiya"
};

const ihecGovernorates = {
    "بەغداد 1": "Baghdad 1",
    "بەغداد 2": "Baghdad 2",
    "هەولێر": "Erbil",
    "سلێمانی": "Sulaymaniyah",
    "دهۆک": "Duhok",
    "کەرکوک": "Kirkuk",
    "نەینەوا": "Nineveh",
    "ئەنبار": "Anbar",
    "بابل": "Babylon",
    "بەسرە": "Basrah",
    "زی قار": "Dhi Qar",
    "دیالە": "Diyala",
    "کەربەلا": "Karbala",
    "میسان": "Mesan",
    "موسەنا": "Muthana",
    "نەجەف": "Najaf",
    "قادیسیە": "Qadisiya",
    "سەلاحەدین": "Salahaldeen"
};

// Authentication check
// SECURITY FIX: no client-readable token to check anymore (session lives in an
// httpOnly cookie). This is just a fast UI-level redirect for the common case;
// validateSession() below makes the real, authoritative call to /api/verify
// (which reads the cookie) and force-logs-out if it's not valid.
if (!state.user.is_approved && !state.user.is_admin) {
    window.location.href = '/';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    updateAllTranslations();
    startSessionValidation(); // Start checking session every 10 seconds
});

function initializeDashboard() {
    document.getElementById('currentUsername').textContent = state.user.username.toUpperCase();
    
    const clearanceElement = document.getElementById('clearanceLevel');
    
    if (state.user.is_admin) {
        document.getElementById('adminBtn').style.display = 'flex';
        clearanceElement.classList.remove('clearance-level-1');
        clearanceElement.classList.add('clearance-level-admin');
        clearanceElement.textContent = 'MANAGER';
        
        // Show Peshmerga Power card for admins
        const peshmergaCard = document.getElementById('peshmergaCard');
        if (peshmergaCard) peshmergaCard.style.display = '';
    } else {
        clearanceElement.textContent = 'AGENT';
        
        // Hide Peshmerga Power card for non-admins
        const peshmergaCard = document.getElementById('peshmergaCard');
        if (peshmergaCard) peshmergaCard.style.display = 'none';
    }

    renderHomeKpis();
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('languageToggleBtn').addEventListener('click', toggleLanguage);
    document.getElementById('adminBtn')?.addEventListener('click', () => {
        window.location.href = '/admin.html';
    });
    document.getElementById('navHome')?.addEventListener('click', (e) => {
        e.preventDefault();
        goHome();
    });
    document.getElementById('navDatabases')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetDashboard();
    });
    
    document.querySelectorAll('.card[data-db]').forEach(card => {
    card.querySelector('.btn').addEventListener('click', () => {
        if (card.dataset.db === 'ai') {
            openAiModal();
        } else if (card.dataset.db === 'cve') {
            openCveModal();
        } else if (card.dataset.db === 'shad') {
            openShadModal();
        } else {
            selectDatabase(card.dataset.db);
        }
    });
});
    
    document.getElementById('backToDbBtn').addEventListener('click', resetDashboard);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllFields);
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('newSearchBtn').addEventListener('click', resetDashboard);
    
    document.getElementById('closeImageModal').addEventListener('click', () => {
        document.getElementById('imageModal').classList.remove('active');
    });
    
    document.getElementById('closeFamilyModal').addEventListener('click', () => {
        document.getElementById('familyModal').classList.remove('active');
    });

    document.getElementById('closeProfileModal').addEventListener('click', () => {
    document.getElementById('profileModal').classList.remove('active');
});

    document.getElementById('closeLocationModal').addEventListener('click', () => {
        document.getElementById('locationModal').classList.remove('active');
    });

    setupCommandPalette();
}

/* ===== COMMAND PALETTE (⌘K) ===== */
const cmdkState = { open: false, query: '', items: [], selected: 0 };

const CMDK_ACTIONS = [
    { id: 'home', key: 'cmdkActionHome', run: () => goHome() },
    { id: 'databases', key: 'cmdkActionDatabases', run: () => resetDashboard() },
    { id: 'profile', key: 'cmdkActionProfile', run: () => showProfileModal() },
    { id: 'logout', key: 'cmdkActionLogout', run: () => logout() }
];

const CMDK_ICON_ACTION = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>';
const CMDK_ICON_MODULE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>';

function setupCommandPalette() {
    const trigger = document.getElementById('cmdkTrigger');
    const overlay = document.getElementById('cmdkOverlay');
    const input = document.getElementById('cmdkInput');
    if (!trigger || !overlay || !input) return;

    trigger.addEventListener('click', openCommandPalette);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCommandPalette(); });
    input.addEventListener('input', () => { cmdkState.query = input.value; renderCmdkList(); });

    document.addEventListener('keydown', (e) => {
        const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
        if (isModK) {
            e.preventDefault();
            cmdkState.open ? closeCommandPalette() : openCommandPalette();
            return;
        }
        if (!cmdkState.open) return;
        if (e.key === 'Escape') { closeCommandPalette(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); moveCmdkSelection(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveCmdkSelection(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); runCmdkSelected(); }
    });
}

function openCommandPalette() {
    const overlay = document.getElementById('cmdkOverlay');
    const input = document.getElementById('cmdkInput');
    if (!overlay || !input) return;
    cmdkState.open = true;
    cmdkState.query = '';
    input.value = '';
    overlay.classList.add('active');
    renderCmdkList();
    setTimeout(() => input.focus(), 10);
}

function closeCommandPalette() {
    const overlay = document.getElementById('cmdkOverlay');
    if (!overlay) return;
    cmdkState.open = false;
    overlay.classList.remove('active');
}

function getCmdkModules() {
    return Array.from(document.querySelectorAll('#databaseSelection .card[data-db]'))
        .map(card => ({
            db: card.dataset.db,
            label: card.querySelector('.card-title')?.textContent.trim() || card.dataset.db,
            disabled: !!card.querySelector('.btn')?.disabled
        }))
        .filter(m => !m.disabled);
}

function renderCmdkList() {
    const list = document.getElementById('cmdkList');
    if (!list) return;
    const t = translations[state.language];
    const q = cmdkState.query.trim().toLowerCase();

    const actions = CMDK_ACTIONS
        .map(a => ({ ...a, type: 'action', label: t[a.key] || a.id }))
        .filter(a => !q || a.label.toLowerCase().includes(q));

    const modules = getCmdkModules()
        .map(m => ({ ...m, type: 'module' }))
        .filter(m => !q || m.label.toLowerCase().includes(q));

    cmdkState.items = [...actions, ...modules];
    cmdkState.selected = 0;

    if (cmdkState.items.length === 0) {
        list.innerHTML = `<div class="cmdk-empty">${t.cmdkNoResults || 'No results'}</div>`;
        return;
    }

    let html = '';
    if (actions.length) {
        html += `<div class="cmdk-group-label">${t.cmdkActionsGroup || 'ACTIONS'}</div>`;
        actions.forEach((a, i) => { html += cmdkItemHtml(a, i); });
    }
    if (modules.length) {
        html += `<div class="cmdk-group-label">${t.cmdkModulesGroup || 'MODULES'}</div>`;
        modules.forEach((m, i) => { html += cmdkItemHtml(m, actions.length + i); });
    }
    list.innerHTML = html;

    list.querySelectorAll('.cmdk-item').forEach(el => {
        el.addEventListener('click', () => {
            cmdkState.selected = parseInt(el.dataset.index, 10);
            runCmdkSelected();
        });
    });
    highlightCmdkSelection();
}

function cmdkItemHtml(item, index) {
    const icon = item.type === 'action' ? CMDK_ICON_ACTION : CMDK_ICON_MODULE;
    const sub = item.type === 'module' ? `<span class="cmdk-item-sub">${item.db}</span>` : '';
    return `<div class="cmdk-item" data-index="${index}">${icon}<span>${item.label}</span>${sub}</div>`;
}

function highlightCmdkSelection() {
    const list = document.getElementById('cmdkList');
    if (!list) return;
    list.querySelectorAll('.cmdk-item').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.index, 10) === cmdkState.selected);
    });
    const sel = list.querySelector('.cmdk-item.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function moveCmdkSelection(delta) {
    if (cmdkState.items.length === 0) return;
    cmdkState.selected = (cmdkState.selected + delta + cmdkState.items.length) % cmdkState.items.length;
    highlightCmdkSelection();
}

function runCmdkSelected() {
    const item = cmdkState.items[cmdkState.selected];
    if (!item) return;
    closeCommandPalette();
    if (item.type === 'action') {
        item.run();
    } else {
        document.querySelector(`#databaseSelection .card[data-db="${item.db}"] .btn`)?.click();
    }
}

function toggleLanguage() {
    state.language = state.language === 'en' ? 'ku' : 'en';
    localStorage.setItem('bcia_language', state.language);
    updateAllTranslations();
    updateSelectTranslations(); // ADD THIS LINE
    
    if (state.currentDb) {
        renderAllFields();
        if (state.results.length > 0) displayResults();
    }
}

function updateAllTranslations() {
    const t = translations[state.language];
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Update karaba map card (uses karabaMapT translations)
    const cardTitle = document.getElementById('karabaMapCardTitle');
    const cardDesc = document.getElementById('karabaMapCardDesc');
    const cardBtn = document.getElementById('karabaMapCardBtn');
    if (cardTitle && typeof kmT === 'function') {
        cardTitle.textContent = kmT('electricityMap');
        cardDesc.textContent = kmT('electricityMapDesc');
        cardBtn.innerHTML = kmT('accessMap');
    }
    
    // Set text direction for Kurdish
    document.body.style.direction = state.language === 'ku' ? 'ltr' : 'ltr';
}

function selectDatabase(db) {
    state.currentDb = db;
    state.allFields = {};
    
    document.getElementById('homeView')?.classList.add('hidden');
    document.getElementById('databaseSelection').classList.add('hidden');
    document.getElementById('searchContainer').classList.remove('hidden');

    const t = translations[state.language];
    const title = t[db] || db.toUpperCase();
    document.getElementById('searchTitle').textContent = title;
    const crumbEl = document.getElementById('breadcrumbCurrent');
    if (crumbEl) crumbEl.textContent = title;

    if (db === 'city') {
        showCitySelector();
    } else if (db === 'iraq2022') {
        showIraq2022ProvinceSelector();
    } else if (db === 'ihec') {
        showGovernorateSelector();
    } else if (db === 'parwarda') {
        showPersonTypeSelector();
    } else if (db === 'shealth') {
        renderAllFields();
    } else if (db === 'pension') {
        renderAllFields();
    } else if (db === 'relatives') {
        showRelativesSearchType();
    } else if (db === 'truecaller') {
    renderAllFields();
    } else {
        renderAllFields();
    }
}

function showCitySelector() {
    const t = translations[state.language];
    const optionsContainer = document.getElementById('dbOptions');
    let html = `<div class="form-group"><label>${t.selectZone}</label><select id="citySelect" class="w-full">`;
    html += `<option value="">${t.chooseCity}</option>`;
    
    for (const [kurdishName, englishName] of Object.entries(cities)) {
        html += `<option value="${kurdishName}">${kurdishName} [${englishName}]</option>`;
    }
    
    html += '</select></div>';
    optionsContainer.innerHTML = html;
    
    document.getElementById('citySelect').addEventListener('change', (e) => {
        state.currentCity = e.target.value;
        if (state.currentCity) renderAllFields();
    });
}

function showGovernorateSelector() {
    const t = translations[state.language];
    const optionsContainer = document.getElementById('dbOptions');
    let html = `<div class="form-group"><label>${t.selectGovernorate}</label><select id="governorateSelect" class="w-full">`;
    html += `<option value="">${t.chooseGovernorate}</option>`;
    
    for (const [kurdishName, englishName] of Object.entries(ihecGovernorates)) {
        html += `<option value="${kurdishName}">${kurdishName} [${englishName}]</option>`;
    }
    
    html += '</select></div>';
    optionsContainer.innerHTML = html;
    
    document.getElementById('governorateSelect').addEventListener('change', (e) => {
        state.currentGovernorate = e.target.value;
        if (state.currentGovernorate) renderAllFields();
    });
}

function showIraq2022ProvinceSelector() {
    const t = translations[state.language];
    const optionsContainer = document.getElementById('dbOptions');
    let html = `<div class="form-group"><label>${t.selectProvince}</label><select id="iraq2022ProvinceSelect" class="w-full">`;
    html += `<option value="">${t.chooseProvince}</option>`;
    
    for (const [kurdishName, englishName] of Object.entries(iraq2022Provinces)) {
        html += `<option value="${kurdishName}">${kurdishName} [${englishName}]</option>`;
    }
    
    html += '</select></div>';
    optionsContainer.innerHTML = html;
    
    document.getElementById('iraq2022ProvinceSelect').addEventListener('change', (e) => {
        state.currentProvince = e.target.value;
        if (state.currentProvince) renderAllFields();
    });
}

function showPersonTypeSelector() {
    const t = translations[state.language];
    const optionsContainer = document.getElementById('dbOptions');
    
    optionsContainer.innerHTML = `
        <div class="form-group">
            <label>${t.selectCategory}</label>
            <select id="personTypeSelect" class="w-full">
                <option value="">${t.chooseType}</option>
                <option value="employees">${t.employees}</option>
                <option value="students">${t.students}</option>
            </select>
        </div>
    `;
    
    document.getElementById('personTypeSelect').addEventListener('change', (e) => {
        state.personType = e.target.value;
        if (state.personType) renderAllFields();
    });
}

function getFieldDefinitions() {
    const t = translations[state.language];
    
    if (state.currentDb === 'sayara') {
        return {
            autoNo: t.autoNo,
            Model: t.Model,
            regName: t.regName,
            mobile: t.mobile,
            annualNo: t.annualNo,
            shassy: t.shassy
        };
    } else if (state.currentDb === 'city') {
        return {
            rc_no: t.rc_no,
            fam_no: t.fam_no,
            seq_no: t.seq_no,
            p_first: t.p_first,
            p_father: t.p_father,
            p_grand: t.p_grand,
            p_mother: t.p_mother,
            gr_mother: t.gr_mother,
            p_birth: t.p_birth,
            ss_id_no: t.ss_id_no,
            p_job: t.p_job
        };
    } else if (state.currentDb === 'iraq2022') {
        return {
            RC_NO: t.rc_no,
            FAM_NO: t.fam_no,
            SEQ_NO: t.seq_no,
            P_FIRST: t.p_first,
            P_FATHER: t.p_father,
            P_GRAND: t.p_grand,
            P_MOTHER: t.p_mother,
            GR_MOTHER: t.gr_mother,
            P_BIRTH: t.p_birth,
            SS_ID_NO: t.ss_id_no,
            P_JOB: t.p_job
        };
    } else if (state.personType === 'employees') {
        return {
            code: t.code,
            firstName: t.firstName,
            fatherName: t.fatherName,
            grandName: t.grandName,
            fullName: t.fullName,
            motherName: t.motherName,
            phone: t.phone,
            birthYear: t.birthYear,
            fld_organization_fullname: t.School
        };
    } else if (state.personType === 'students') {
        return {
            studentId: t.studentId,
            firstName: t.firstName,
            secondName: t.secondName,
            thirdName: t.thirdName,
            fourthName: t.fourthName,
            fullName: t.fullName,
            motherName: t.motherName,
            phone: t.phone,
            studentCarerPhone: t.studentCarerPhone,
            birthYear: t.birthYear,
            GenderTypeName: t.gender,
            fld_organization_fullname: t.School
        };
    } else if (state.currentDb === 'karaba') {
        return {
            accountNo: t.accountNo,
            meterSerial: t.meterSerial,
            subscriberName: t.subscriberName,
            area: t.area,
            feeder: t.feeder,
            zone: t.zone,
            subZone: t.subZone,
            blockNo: t.blockNo,
            stsNo: t.stsNo
        };
    } else if (state.currentDb === 'ihec') {
        return {
            perId: t.perId,
            famNo: t.famNo,
            firstName: t.firstName,
            fatherName: t.fatherName,
            grandName: t.grandName,
            birthYear: t.birthYear,
            pcNo: t.pcNo,
            vrcId: t.vrcId,
            govName: t.govName,
            pcName: t.pcName,
            vrcName: t.vrcName,
            psNo: t.psNo,
            voterSeq: t.voterSeq
        };
    } else if (state.currentDb === 'facebook') {
        return {
            userId: t.userId,
            phone: t.phone
        };
    } else if (state.currentDb === 'qicard') {
        return {
            govId: t.govId,
            name: t.name,
            cardNumber: t.cardNumber,
            mobile: t.mobile,
            smartCardNumber: t.smartCardNumber,
            idNumber: t.idNumber,
            motherName: t.motherName
        };
    } else if (state.currentDb === 'asiacell') {
        return {
            name: t.name,
            phone: t.phone,
            idNumber: t.idNumber,
            province: t.province
        };
    } else if (state.currentDb === 'hezakani') {
        return {
            type: t.type,
            name01: t.name01,
            name02: t.name02,
            name03: t.name03,
            name04: t.name04,
            nameCaption: t.nameCaption,
            motherName: t.motherName,
            lNo: t.lNo,
            lDate: t.lDate,
            cases: t.cases,
            place: t.place,
            description: t.description
        };
    } else if (state.currentDb === 'shealth') {
    return {
        phone: t.phone
    };
    

    } else if (state.currentDb === 'pension') {
    return {
        // Pension holder fields
        PUID: t.puid,
        UPN: t.upn,
        PUIDOld1: t.puidOld,
        FullName: t.fullName,
        FirstName: t.firstName,
        SecondName: t.secondName,
        ThirdName: t.thirdName,
        LastName: t.lastName,
        PhoneNumber: t.phoneNumber,
        BioMetric: t.bioMetric,
        DocumentNumber: t.documentNumber,
        NationalNumber: t.nationalNumber,
        CivilNumber: t.civilNumber,
        Bank: t.bank,
        Ministry: t.ministry,
        PGDOrganization: t.pgdOrganization,
        
        // Heir fields
        HeirCode: t.heirCode,
        HeirFullName: t.heirFullName,
        HeirMotherName: t.heirMotherName,
        HeirDateOfBirth: t.heirDateOfBirth,
        HeirGender: t.heirGender,
        HeirPhoneNumber: t.heirPhoneNumber,
        HeirRelationshipType: t.heirRelationshipType,
        HeirUpnCode: t.heirUpnCode,
        HeirCivilIdCardNumber: t.heirCivilId,
        HeirNationalIdCardNumber: t.heirNationalId
    };

    } else if (state.currentDb === 'truecaller') {
    return {
        phone: t.searchPhone
    };

    } else if (state.currentDb === 'truecaller') {
    return {
        phone: t.searchPhone
    };


    } else if (state.currentDb === 'lawyers') {
    return {
        name: t.lawyerName,
        mobile: t.lawyerMobile,
        number: t.lawyerNumber,
        email: t.lawyerEmail,
        permission: t.lawyerPermission,
        upn_no: t.lawyerUpn
    };
}else if (state.currentDb === 'fib') {
        return {
            phone: t.fibSearchPhone  // "Phone Number"
        };
    

} else if (state.currentDb === 'relatives') {
        if (state.relativesType === 'father') {
            return {
                personFatherFirstName: t.personFatherFirstName,
                personFatherFatherName: t.personFatherFatherName,
                personFatherGrandfatherName: t.personFatherGrandfatherName,
                personFatherMotherName: t.personFatherMotherName,
                personFatherMotherFatherName: t.personFatherMotherFatherName
            };
        } else if (state.relativesType === 'mother') {
            return {
                personMotherFirstName: t.personMotherFirstName,
                personMotherFatherName: t.personMotherFatherName,
                personMotherGrandfatherName: t.personMotherGrandfatherName,
                personMotherMotherName: t.personMotherMotherName,
                personMotherMotherFatherName: t.personMotherMotherFatherName
            };
        }
        return {};
    }
}


function showRelativesSearchType() {
    const t = translations[state.language];
    const optionsContainer = document.getElementById('dbOptions');
    
    optionsContainer.innerHTML = `
        <div class="form-group">
            <label><span data-translate="searchType">${t.searchType}</span></label>
            <select id="relativesTypeSelect" class="w-full">
                <option value="" data-translate="chooseType">${t.chooseType}</option>
                <option value="father" data-translate="fatherRelatives">${t.fatherRelatives}</option>
                <option value="mother" data-translate="motherRelatives">${t.motherRelatives}</option>
            </select>
        </div>
        <div style="background: var(--input-bg); border: 2px solid var(--primary-green); padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="color: var(--primary-green); font-size: 0.9rem;">
                ⚠️ <span data-translate="kurdistanOnly">${t.kurdistanOnly}</span>
            </p>
        </div>
    `;
    
    document.getElementById('relativesTypeSelect').addEventListener('change', (e) => {
        state.relativesType = e.target.value;
        if (state.relativesType) renderAllFields();
    });
}

// Update select options when language changes
function updateSelectTranslations() {
    const relativesTypeSelect = document.getElementById('relativesTypeSelect');
    if (relativesTypeSelect) {
        const t = translations[state.language];
        const currentValue = relativesTypeSelect.value;
        relativesTypeSelect.innerHTML = `
            <option value="">${t.chooseType}</option>
            <option value="father">${t.fatherRelatives}</option>
            <option value="mother">${t.motherRelatives}</option>
        `;
        relativesTypeSelect.value = currentValue;
    }
}



function renderAllFields() {
    if ((state.currentDb === 'city' && !state.currentCity) || 
        (state.currentDb === 'iraq2022' && !state.currentProvince) ||
        (state.currentDb === 'ihec' && !state.currentGovernorate) ||
        (state.currentDb === 'parwarda' && !state.personType)) {
        return;
    }
    
    const t = translations[state.language];
    const fieldDefs = getFieldDefinitions();
    const container = document.getElementById('allFieldsGrid');
    container.innerHTML = '';
    
    for (const [field, label] of Object.entries(fieldDefs)) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-item';

        const isGender = field === 'gender' || field === 'GenderTypeName';
        fieldDiv.innerHTML = `
            <label>${label.toUpperCase()}</label>
            ${isGender ? `
            <select id="field_${field}" data-field="${field}" style="width:100%;padding:0.7rem 0.95rem;background:var(--secondary-bg);border:1.5px solid var(--dark-green);color:var(--primary-green);font-family:'Rudaw Bold','Cairo',monospace;font-size:var(--fs-sm);border-radius:4px;font-weight:700;">
                <option value="">-- ${t.enterValue} ${label} --</option>
                <option value="نێر">${t.genderMale}</option>
                <option value="مێ">${t.genderFemale}</option>
            </select>
            ` : `
            <input 
                type="text" 
                id="field_${field}"
                data-field="${field}"
                placeholder="${t.enterValue} ${label}..."
                autocomplete="off"
            >
            `}
        `;
        
        const inputEl = fieldDiv.querySelector(isGender ? 'select' : 'input');
        inputEl.addEventListener(isGender ? 'change' : 'input', (e) => {
            const value = e.target.value.trim();
            if (value) {
                state.allFields[field] = value;
                fieldDiv.classList.add('active');
            } else {
                delete state.allFields[field];
                fieldDiv.classList.remove('active');
            }
            updateSearchButton();
        });
        
        container.appendChild(fieldDiv);
    }
    
    // Restore previously filled values
    for (const [field, value] of Object.entries(state.allFields)) {
        const el = document.getElementById(`field_${field}`);
        if (el) {
            el.value = value;
            el.closest('.field-item').classList.add('active');
        }
    }
    
    updateSearchButton();
}

function clearAllFields() {
    state.allFields = {};
    document.querySelectorAll('.field-item input, .field-item select').forEach(el => {
        el.value = '';
        el.closest('.field-item').classList.remove('active');
    });
    updateSearchButton();
}

function updateSearchButton() {
    const hasValues = Object.keys(state.allFields).length > 0;
    const searchBtn = document.getElementById('searchBtn');
    
    if (hasValues) {
        searchBtn.style.display = 'block';
        searchBtn.classList.add('search-active');
    } else {
        searchBtn.style.display = 'none';
        searchBtn.classList.remove('search-active');
    }
    
    updateAllTranslations();
}

async function performSearch() {
    if (Object.keys(state.allFields).length === 0) return;

    // Always ask the server for a free token first. The server decides who
    // actually gets one for free: admins always do, non-admins only for a
    // limited streak before being told captchaRequired — that decision (and
    // the streak count) lives server-side now via /api/captcha/free-token, not
    // in client-side JS, so it can't be skipped by calling the endpoint
    // directly. Only fall back to the real audio/reCAPTCHA modal if the server
    // actually demands it.
    let searchToken;
    try {
        const freeTokenRes = await fetch('/api/captcha/free-token', {
            credentials: 'same-origin'
        });
        const freeTokenData = await freeTokenRes.json();

        if (freeTokenRes.ok && freeTokenData.success) {
            searchToken = freeTokenData.searchToken;
        } else if (freeTokenData.captchaRequired) {
            searchToken = await CaptchaSystem.showModal();
        } else {
            throw new Error(freeTokenData.error || 'Token error');
        }
    } catch (err) {
        if (err.message === 'cancelled') {
            document.getElementById('searchContainer').classList.remove('hidden');
            return;
        }
        alert('CAPTCHA/Token error: ' + err.message);
        return;
    }
    
    document.getElementById('searchContainer').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('progressBar').style.display = 'block';
    
    try {
        let endpoint, body;
        
        if (state.currentDb === 'sayara') {
            endpoint = '/api/search/sayara';
            body = { criteria: state.allFields };
        } else if (state.currentDb === 'city') {
            endpoint = '/api/search/city';
            body = { city: state.currentCity, criteria: state.allFields };
        } else if (state.currentDb === 'iraq2022') {
            endpoint = '/api/search/iraq2022';
            body = { province: state.currentProvince, criteria: state.allFields };
        } else if (state.currentDb === 'karaba') {
            endpoint = '/api/search/karaba';
            body = { criteria: state.allFields };
        } else if (state.currentDb === 'ihec') {
            endpoint = '/api/search/ihec';
            body = { governorate: state.currentGovernorate, criteria: state.allFields };
        } else if (state.currentDb === 'facebook') {
            endpoint = '/api/search/facebook';
            body = { criteria: state.allFields };
        } else if (state.currentDb === 'qicard') {
            endpoint = '/api/search/qicard';
            body = { criteria: state.allFields };
        } else if (state.currentDb === 'asiacell') {
            endpoint = '/api/search/asiacell';
            body = { criteria: state.allFields };
        } else if (state.currentDb === 'hezakani') {
            endpoint = '/api/search/hezakani';
            body = { criteria: state.allFields };
        } else if (state.currentDb === 'relatives') {
    endpoint = '/api/search/relatives';
    body = { searchType: state.relativesType, criteria: state.allFields };
} else if (state.currentDb === 'shealth') {
    endpoint = '/api/search/shealth';
    body = { criteria: state.allFields };
}
else if (state.currentDb === 'pension') {
    endpoint = '/api/search/pension';
    body = { criteria: state.allFields };

} else if (state.currentDb === 'lawyers') {
    endpoint = '/api/search/lawyers';
    body = { criteria: state.allFields };

} else if (state.currentDb === 'truecaller') {
    endpoint = '/api/search/truecaller';
    body = { phone: state.allFields.phone };

    } else if (state.currentDb === 'fib') {
    endpoint = '/api/search/fib';
    body = { phone: state.allFields.phone, generatedsecuretoken: searchToken };
} else {
    endpoint = '/api/search/parwarda';
    body = { personType: state.personType, criteria: state.allFields };
}
        
        body.generatedsecuretoken = searchToken;

const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-search-token': searchToken
    },
    body: JSON.stringify(body)
});
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            state.results = data.results || [];
            state.currentPage = 0;

            // Save to history
            await saveSearchHistory({
                database: state.currentDb,
                criteria: state.allFields,
                results_count: state.results.length
            });
            
            setTimeout(() => {
                document.getElementById('progressBar').style.display = 'none';
                displayResults();
            }, 1000);
        } else {
            throw new Error(data.error || 'Search failed');
        }
    } catch (error) {
        alert('SEARCH PROTOCOL FAILED: ' + error.message);
        resetDashboard();
    } finally {
        document.getElementById('loadingState').classList.add('hidden');
    }
}

async function saveSearchHistory(searchData) {
    try {
        await fetch(`${API_URL}/api/history/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });
        loadSearchHistory();
    } catch (e) {
        console.log('History save failed');
    }
}

async function loadSearchHistory() {
    try {
        const response = await fetch(`${API_URL}/api/history/recent`, {
            credentials: 'same-origin'
        });
        const data = await response.json();
        if (data.success) {
            state.searchHistory = data.history || [];
            updateRecentSearchesUI();
            renderHomeActivityFeed();
            renderHomeKpis();
            renderHomeSearchTrend();
        }
    } catch (e) {
        console.log('History load failed');
    }
}

function updateRecentSearchesUI(targetId = 'recentSearchesContainer') {
    const container = document.getElementById(targetId);
    if (!container) return;

    const recent = state.searchHistory.slice(0, 10);
    if (recent.length === 0) {
        container.innerHTML = '<p style="color: var(--text-dim); padding: 1rem;">No recent searches</p>';
        return;
    }

    container.innerHTML = recent.map((item, i) => {
        const data = JSON.parse(item.search_data);
        const time = new Date(item.timestamp).toLocaleString();
        return `
            <div class="recent-search-item" onclick="loadHistorySearch(${i})">
                <div><strong>${data.database.toUpperCase()}</strong></div>
                <div style="font-size: 0.85rem; color: var(--text-dim);">${time}</div>
                <div style="font-size: 0.85rem;">Results: ${data.results_count}</div>
            </div>
        `;
    }).join('');
}

/* ===== HOME / COMMAND CENTER ===== */

/** Buckets state.searchHistory into counts for the last `n` days (oldest first). */
function bucketSearchesByDay(n) {
    const days = [];
    const counts = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        days.push(d);
        counts.push(0);
    }
    state.searchHistory.forEach(item => {
        const t = new Date(item.timestamp);
        const idx = days.findIndex(d => d.toDateString() === t.toDateString());
        if (idx !== -1) counts[idx]++;
    });
    return { days, counts };
}

/** Builds a smooth cubic-bezier path string through evenly spaced points. */
function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[i + 1];
        const mx = (x0 + x1) / 2;
        d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return d;
}

function renderHomeKpis() {
    const dbCountEl = document.getElementById('kpiDbCount');
    if (dbCountEl) dbCountEl.textContent = document.querySelectorAll('#databaseSelection .card[data-db]').length;

    const searchesEl = document.getElementById('kpiSearches');
    if (searchesEl) searchesEl.textContent = state.searchHistory.length;

    const bookmarksEl = document.getElementById('kpiBookmarks');
    if (bookmarksEl) bookmarksEl.textContent = state.bookmarks.length;

    const clearanceEl = document.getElementById('kpiClearance');
    const isAdmin = !!(state.user && state.user.is_admin);
    if (clearanceEl) clearanceEl.textContent = isAdmin ? 'MANAGER' : 'AGENT';

    const homeUsernameEl = document.getElementById('homeUsername');
    if (homeUsernameEl && state.user) homeUsernameEl.textContent = state.user.username.toUpperCase();

    const sparkEl = document.getElementById('kpiSparkSearches');
    if (sparkEl) {
        const { counts } = bucketSearchesByDay(7);
        const max = Math.max(1, ...counts);
        const w = 100, h = 32;
        const pts = counts.map((c, i) => [
            (i / (counts.length - 1)) * w,
            h - 4 - (c / max) * (h - 8)
        ]);
        const path = smoothPath(pts);
        sparkEl.innerHTML = `<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/>`;
    }
}

function renderHomeSearchTrend() {
    const el = document.getElementById('homeTrendChart');
    if (!el) return;

    const { days, counts } = bucketSearchesByDay(7);
    const max = Math.max(1, ...counts);
    const width = 560, height = 160;
    const padL = 8, padR = 8, padT = 16, padB = 26;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const pts = counts.map((c, i) => [
        padL + (i / (counts.length - 1)) * plotW,
        padT + plotH - (c / max) * plotH
    ]);
    const linePath = smoothPath(pts);
    const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${padT + plotH} L ${pts[0][0]},${padT + plotH} Z`;

    const gridLines = [0, 0.5, 1].map(f => {
        const y = padT + plotH * f;
        return `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="var(--border-hairline)" stroke-width="1"/>`;
    }).join('');

    const dots = pts.map(([x, y], i) => counts[i] > 0
        ? `<circle cx="${x}" cy="${y}" r="2.6" fill="var(--z2)" stroke="var(--accent)" stroke-width="1.6"/>`
        : '').join('');

    const labels = days.map((d, i) => {
        const x = pts[i][0];
        const label = d.toLocaleDateString('en', { weekday: 'short' });
        return `<text x="${x}" y="${height - 6}" text-anchor="middle" class="chart-axis-label">${label}</text>`;
    }).join('');

    el.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
                </linearGradient>
            </defs>
            ${gridLines}
            <path d="${areaPath}" fill="url(#trendFill)" stroke="none"/>
            <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            ${dots}
            ${labels}
        </svg>
    `;
}

function renderHomeActivityFeed() {
    const container = document.getElementById('homeRecentSearches');
    if (!container) return;

    const recent = state.searchHistory.slice(0, 8);
    if (recent.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = recent.map((item, i) => {
        const data = JSON.parse(item.search_data);
        const time = new Date(item.timestamp).toLocaleString();
        return `
            <div class="activity-item" onclick="loadHistorySearch(${i})">
                <span class="activity-dot"></span>
                <div class="activity-body">
                    <div class="activity-title">${data.database.toUpperCase()}</div>
                    <div class="activity-meta">${time} &middot; ${data.results_count} results</div>
                </div>
            </div>
        `;
    }).join('');
}

function loadHistorySearch(index) {
    const item = state.searchHistory[index];
    const data = JSON.parse(item.search_data);
    
    selectDatabase(data.database);
    setTimeout(() => {
        state.allFields = data.criteria;
        renderAllFields();
    }, 100);
}

window.loadHistorySearch = loadHistorySearch;

function displayResults() {
        document.getElementById('resultsContainer').classList.add('animate-fade-in-up');
    const t = translations[state.language];
    document.getElementById('resultsContainer').classList.remove('hidden');
    
    const totalPages = Math.ceil(state.results.length / state.resultsPerPage);
    const start = state.currentPage * state.resultsPerPage;
    const end = Math.min(start + state.resultsPerPage, state.results.length);
    const pageResults = state.results.slice(start, end);
    
    const container = document.getElementById('resultsContent');
    container.innerHTML = `
        <div class="result-card" style="background: var(--dark-green); border-color: var(--primary-green);">
            <div class="result-header">
                <div class="terminal-text"><strong>${t.totalRecords}: ${state.results.length}</strong></div>
                <div class="terminal-text">${t.pageOf} ${state.currentPage + 1} ${t.of} ${totalPages || 1}</div>
            </div>
        </div>
    `;
    
    pageResults.forEach((result, index) => {
        container.appendChild(createResultCard(result, start + index + 1));
    });
    
    renderPagination(totalPages);
}

function createResultCard(result, index) {
    const t = translations[state.language];
    const card = document.createElement('div');
    card.className = 'result-card corner-bracket encrypted-text premium-card animate-fade-in-up';
    
    let html = `
    <div class="result-header">
        <div class="result-number terminal-text">${t.record} #${String(index).padStart(4, '0')}</div>
        <div class="result-type terminal-text">${getDatabaseTitle().toUpperCase()}</div>
    </div>
    
    ${state.currentDb === 'pension' && result.source_table ? `
        <div style="background: ${result.source_table.includes('heir') ? 'rgba(91, 146, 217, 0.12)' : 'rgba(var(--accent-rgb), 0.12)'};
                    border-left: 4px solid ${result.source_table.includes('heir') ? 'var(--info)' : 'var(--primary-green)'};
                    padding: 12px; 
                    margin: 10px 0; 
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;">
            <span style="font-size: 1.5rem;">${result.source_table.includes('heir') ? '◆' : '▣'}</span>
            <div>
                <div style="color: var(--primary-green); font-weight: bold; font-size: 0.9rem;">
                    ${result.source_table.includes('heir') ? t.heirRecord : t.pensionHolder}
                </div>
                <div style="color: var(--text-dim); font-size: 0.8rem;">
                    ${result.source_table.replace(/_/g, ' ').toUpperCase()}
                    ${result.is_related_record ? ' • ' + t.relatedHeirs : ''}
                </div>
            </div>
        </div>
    ` : ''}
    
    <div class="result-fields-grid">
`;

    const fieldMap = getFullFieldMap(result);

    for (const [key, label] of Object.entries(fieldMap)) {
        let value = result[key] || 
                    result[key.toLowerCase()] || 
                    result[key.toUpperCase()] || 
                    result[key.replace(/^fld_/, '')] ||
                    result[key.replace(/_/g, '')];

        if (value !== null && value !== undefined && value !== '' && value !== 'null') {
            if (typeof value === 'string') value = value.trim();
            if (value) {
                html += `
                    <div class="result-field">
                        <span class="field-label terminal-text">${label.toUpperCase()}</span>
                        <span class="field-value terminal-text">${escapeHtml(String(value))}</span>
                    </div>
                `;
            }
        }
    }

    html += '</div><div class="result-actions">';

// Export buttons
html += `
    <button class="btn btn-primary" onclick="exportSingleCSV(${index})">📥 ${t.exportCSV}</button>
    <button class="btn btn-primary" onclick="exportSinglePDF(${index})">📄 ${t.exportPDF}</button>
    <button class="btn btn-primary" onclick="bookmarkRecord(${index - 1})">⭐ ${t.bookmark}</button>
`;

// ADD THIS: View all heirs button for pension records
if (state.currentDb === 'pension' && result.PensionId && !result.source_table?.includes('heir')) {
    html += `<button class="btn btn-primary" onclick="viewPensionHeirs('${escapeJsAttr(result.PensionId)}')">${t.viewFamily || 'VIEW HEIRS'}</button>`;
}
    
    // CHECK FOR ATTACHMENT ID - EMPLOYEES USE fld_attachment_id_ref, STUDENTS USE AttachmentIdRef
    let attachmentId = null;

if (state.personType === 'employees') {
    attachmentId = result.fld_attachment_id_ref || result.attachment_id_ref;
} else if (state.personType === 'students') {
    attachmentId = result.AttachmentIdRef || result.attachmentIdRef;
}

if (attachmentId && state.currentDb === 'parwarda') {
    html += `<button class="btn btn-primary" onclick="viewImage('${escapeJsAttr(attachmentId)}', '${escapeJsAttr(state.personType)}')">${t.viewBiometric}</button>`;
}
    if (state.currentDb === 'city' && result.fam_no) {
        html += `<button class="btn btn-primary" onclick="viewFamily('${escapeJsAttr(result.fam_no)}')">${t.viewFamily}</button>`;
        html += `<button class="btn btn-primary" onclick="viewFamilyTree('${escapeJsAttr(result.fam_no)}')">${t.viewFamilyTree || 'FAMILY TREE'}</button>`;
    }
    
    if (state.currentDb === 'iraq2022' && result.FAM_NO) {
        html += `<button class="btn btn-primary" onclick="viewIraq2022Family('${escapeJsAttr(result.FAM_NO)}')">${t.viewFamily}</button>`;
        html += `<button class="btn btn-primary" onclick="viewFamilyTree2022('${escapeJsAttr(result.FAM_NO)}')">${t.viewFamilyTree || 'FAMILY TREE'}</button>`;
    }
    
    if (state.currentDb === 'karaba' && result.Latitude && result.Longitude) {
        html += `<button class="btn btn-primary" onclick="viewLocation('${escapeJsAttr(result.Latitude)}', '${escapeJsAttr(result.Longitude)}', '${escapeJsAttr(result.SubscriberName || 'Unknown')}', '${escapeJsAttr(result.AccountNo || 'N/A')}')">${t.viewLocation}</button>`;
    }

    if (state.currentDb === 'fib') {
    if (!result.found) {
        html += `
            <div style="background: rgba(var(--danger-rgb), 0.15); border: 2px solid var(--danger-red); padding: 20px; border-radius: 8px; margin-top: 10px; text-align: center;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
                <div style="color: var(--danger-red); font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;" data-translate="fibNoAccount">${t.fibNoAccount}</div>
                <div style="color: var(--text-dim); font-size: 0.9rem;" data-translate="fibNoAccountDesc">${t.fibNoAccountDesc}</div>
            </div>
        `;
    } else if (result.data) {
        const d = result.data;
        html += `
            <div style="background: rgba(var(--accent-rgb), 0.1); border: 2px solid var(--primary-green); padding: 20px; border-radius: 8px; margin-top: 10px;">
                <div style="font-size: 1rem; margin-bottom: 15px; color: var(--primary-green); font-weight: bold; letter-spacing: 2px;">FIB ACCOUNT DATA</div>
                <div style="border-top: 1px solid var(--dark-green); padding-top: 15px;">
                    <div class="result-field">
                        <span class="field-label">${t.fibDisplayName}</span>
                        <span class="field-value" style="color: var(--primary-green); font-size: 1.1rem;">${d.displayName}</span>
                    </div>
                    <div class="result-field">
                        <span class="field-label">${t.fibFirstName}</span>
                        <span class="field-value">${d.firstName}</span>
                    </div>
                    <div class="result-field">
                        <span class="field-label">${t.fibLastName}</span>
                        <span class="field-value">${d.lastName}</span>
                    </div>
                    <div class="result-field">
                        <span class="field-label">${t.fibEnglishFirstName}</span>
                        <span class="field-value">${d.englishFirstName}</span>
                    </div>
                    <div class="result-field">
                        <span class="field-label">${t.fibEnglishLastName}</span>
                        <span class="field-value">${d.englishLastName}</span>
                    </div>
                    <div class="result-field">
                        <span class="field-label">${t.fibPhoneNumber}</span>
                        <span class="field-value">${d.phoneNumber}</span>
                    </div>
                </div>
            </div>
        `;
    }
}



    if (state.currentDb === 'truecaller') {
    if (result.blocked) {
        html += `
            <div style="background: rgba(var(--danger-rgb), 0.15); border: 2px solid var(--danger-red); padding: 15px; border-radius: 8px; margin-top: 10px; text-align: center;">
                <span style="color: var(--danger-red); font-weight: bold; font-size: 1.1rem;">⚠️ ${t.blockedNumber}</span>
            </div>
        `;
    } else {
        html += `
            <div style="background: rgba(var(--accent-rgb), 0.1); border: 2px solid var(--primary-green); padding: 15px; border-radius: 8px; margin-top: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 3rem;">📞</div>
                    <div>
                        <div style="color: var(--primary-green); font-weight: bold; font-size: 1.2rem; margin-bottom: 5px;">
                            ${result.name}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 1rem;">
                            ${result.phone}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

    if (state.currentDb === 'lawyers' && result.number) {
        html += `
            <div style="margin-top: 15px;" id="lawyerImgContainer_${escapeJsAttr(result.number)}">
                <button class="btn btn-primary" onclick="viewLawyerImage('${escapeJsAttr(result.number)}', this)">
                    📷 VIEW PHOTO
                </button>
            </div>
        `;
    }
    
    html += '</div>';
    card.innerHTML = html;
    return card;
}

function getDatabaseTitle() {
    const t = translations[state.language];
    
    if (state.currentDb === 'sayara') return t.sayara;
    if (state.currentDb === 'city') return t.city;
    if (state.currentDb === 'parwarda') {
        return state.personType === 'employees' ? t.employees : t.students;
    }
    if (state.currentDb === 'relatives') {
        return state.relativesType === 'father' ? t.fatherRelatives : t.motherRelatives;
    }
    if (state.currentDb === 'hezakani') return t.hezakani;  
    if (state.currentDb === 'pension') return t.pension;// ADD THIS LINE
    return state.currentDb?.toUpperCase() || 'UNKNOWN';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// SECURITY FIX: safe to interpolate into `onclick="fn('...')"` or an HTML attribute value.
// escapeHtml() alone does not escape ' or ", so it is not safe inside attributes/inline handlers.
function escapeJsAttr(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getFullFieldMap(result) {
    const t = translations[state.language];

    if (state.currentDb === 'sayara') {
    return {
        Auto_No: t.autoNo,
        Reg_Name: t.regName,
        mobile: t.mobile,
        Annual_No: t.annualNo,
        Shassy: t.shassy,
        Model: t.Model,
        Makee: t.Makee,
        Color: t.Color,
        CarType: t.CarType,
        Gear: t.Gear,
        Auto_Type: t.Auto_Type,
        year: t.year,
        engine_no: t.engine_no,
        weight: t.weight,
        seats: t.seats,
        OwnerAdress: t.ownerAddress,
        Address2: t.address2,
        table_name: t.table_name
    };
}

    if (state.currentDb === 'karaba') {
        return {
            AccountNo: t.accountNo,
            MeterSerial: t.meterSerial,
            SubscriberName: t.subscriberName,
            Area: t.area,
            Area_2: t.area + ' 2',
            Feeder: t.feeder,
            Zone: t.zone,
            SubZone: t.subZone,
            BlockNo: t.blockNo,
            STSNo: t.stsNo,
            EnclosureSN: t.enclosureSN,
            Meter: t.meter,
            Reading: t.reading,
            Latitude: t.latitude,
            Longitude: t.longitude,
            Status: t.status,
            OldMeter: t.oldMeter,
            Substation: t.substation,
            Comment: t.comment,
            UserName: t.userName,
            TransformerType: t.transformerType,
            TransformerNumber: t.transformerNumber,
            PointId: t.pointId
        };
    }

    if (state.currentDb === 'ihec') {
        return {
            PER_ID: t.perId,
            fam_no: t.famNo,
            p_first: t.firstName,
            p_father: t.fatherName,
            p_grand: t.grandName,
            p_birth: t.birthYear,
            PER_VRTYPE_2013: t.vrType,
            PCNO: t.pcNo,
            VRC_ID: t.vrcId,
            GOV_MOT_ID: t.govMotId,
            GOV_NAME_AR: t.govName,
            PC_NAME: t.pcName,
            PC_ADDRESS: t.pcAddress,
            VRC_NAME_AR: t.vrcName,
            VRC_ADDRESS: t.vrcAddress,
            VRC_OID: t.vrcOid,
            PSNO: t.psNo,
            VoterSEQ: t.voterSeq,
            VoterCrad_Status: t.voterCardStatus,
            Regestered_Case: t.registeredCase,
            new_card_status: t.newCardStatus
        };
    }

    if (state.currentDb === 'facebook') {
        return {
            c1: t.userId,
            c2: t.phone,
            c3: t.fullName,
            c4: t.fullName + ' (Alt)',
            c5: t.gender,
            c6: t.profileUrl,
            c7: t.fullName + ' (Display)',
            c8: t.username,
            c9: t.bio,
            c10: t.work,
            c11: t.work + ' (Position)',
            c12: t.education,
            c13: t.location,
            c14: t.hometown,
            c15: t.education + ' (School)',
            c16: 'Email',
            c17: 'Field 17',
            c18: 'Field 18',
            c19: 'Field 19',
            c20: 'Date 1',
            c21: 'Date 2',
            c22: t.relationship,
            c23: 'Field 23'
        };
    }

    if (state.currentDb === 'qicard') {
        return {
            'الرقم الحكومي': t.govId,
            'المحافظة الحالية': t.currentGovernorate,
            'القضاء الحالي': t.currentDistrict,
            'الناحية الحالية': 'Current Sub-district',
            'الاسم الثلاثي المرسل للذكية': t.name,
            'محل الولادة': t.birthPlace,
            'رقم  التمونية': t.cardNumber,
            'جهة  الاصدار': t.issueAuthority,
            'الجنسية': t.nationality,
            'عدد الافراد': t.familyMembers,
            'mobile': t.mobile,
            'رقم الاضبارة': t.folderNumber,
            'Status': 'Status',
            'رقم الذكية': t.smartCardNumber,
            'الرقم التعريفي': t.idNumber,
            'تاريخ الاصدار': t.issueDate,
            'تاريخ الميلاد': t.birthDate,
            'الاسم حسب الشركة': 'Company Name',
            'اسم الام': t.motherName,
            'اسم الزوجة': t.wifeName,
            'الحالة الاجتماعية': t.maritalStatus,
            'السجل': t.registryNumber,
            'الصحيفة': t.pageNumber,
            'دائرة الاصدار': t.issueOffice,
            'رقم الموبايل': 'Mobile',
            'محافظة الاصدار': t.issueGovernorate
        };
    }

    if (state.currentDb === 'asiacell') {
        return {
            name: t.name,
            province: t.province,
            status: t.status,
            phone: t.phone,
            birthdate: t.birthdate,
            id_number: t.idNumber,
            contract_date: t.contractDate
        };
    }

    if (state.currentDb === 'relatives') {
        const relationshipLabel = state.relativesType === 'father' 
            ? t.paternalUncleAunt 
            : t.maternalUncleAunt;
        
        return {
            p_first: t.p_first,
            p_father: t.p_father,
            p_grand: t.p_grand,
            p_mother: t.p_mother,
            gr_mother: t.gr_mother,
            p_birth: t.p_birth,
            ss_id_no: t.ss_id_no,
            p_job: t.p_job,
            fam_no: t.fam_no,
            city_name: t.zone,
            relationship: relationshipLabel
        };
    }

    if (state.currentDb === 'city') {
        return {
            fam_no: t.fam_no,
            p_first: t.p_first,
            p_father: t.p_father,
            p_grand: t.p_grand,
            p_mother: t.p_mother,
            gr_mother: t.gr_mother,
            p_birth: t.p_birth,
        };
    }

    if (state.currentDb === 'iraq2022') {
        return {
            FAM_NO: t.fam_no,
            P_FIRST: t.p_first,
            P_FATHER: t.p_father,
            P_GRAND: t.p_grand,
            P_BIRTH: t.p_birth,
            P_MOTHER: t.p_mother,
            GR_MOTHER: t.gr_mother,
        };
    }

    if (state.personType === 'employees') {
        return {
            fld_person_code: t.code,
            fld_fullname: t.fullName,
            fld_person_fname: t.firstName,
            fld_person_lname_1: t.fatherName,
            fld_person_lname_2: t.p_grand,
            fld_person_mother_name: t.motherName,
            fld_phone_mobile: t.phone,
            fld_birth_date: t.birthYear,
            resid_location: t.resid_location,
            fld_address: t.fld_address,
            fld_organization_fullname: t.fld_organization_fullname,
            fld_position: t.fld_position,
            fld_department: t.fld_department,
            fld_salary: t.fld_salary
        };
    }

    if (state.personType === 'students') {
        return {
            StudentId: t.studentId,
            FullName: t.fullName,
            FirstName: t.firstName,
            SecondName: t.secondName,
            ThirdName: t.thirdName,
            FourthName: t.fourthName,
            MotherName: t.motherName,
            Phone: t.phone,
            StudentCarerPhone: t.studentCarerPhone,
            Birthdate: t.birthYear,
            Address: t.Address,
            fld_organization_fullname: t.School,
            Grade: t.Grade,
            Class: t.Class,
            GenderTypeName: 'Gender'
        };
    }

    if (state.currentDb === 'hezakani') {
        return {
            Type: t.type,
            Name_01: t.name01,
            Name_02: t.name02,
            Name_03: t.name03,
            Name_04: t.name04,
            Name_Caption: t.nameCaption,
            Mother_Name: t.motherName,
            L_No: t.lNo,
            L_Date: t.lDate,
            Cases: t.cases,
            Place: t.place,
            Description: t.description
        };
    }

    if (state.currentDb === 'shealth') {
    return {
        id: 'ID',
        name: t.name,
        title: t.title,
        identity_type: t.identityType,
        identity_card_number: t.identityCardNumber,
        resident_type: t.residentType,
        phone: t.phone,
        workplace: t.workplace,
        gender: t.gender,
        female_status: t.femaleStatus,
        birth_date: t.birthDate,
        province: t.province,
        district: t.district,
        center: t.center,
        center_phone: t.centerPhone,
        vaccination_status: t.vaccinationStatus,
        chronic_illnesses: t.chronicIllnesses,
        image_url: t.imageUrl,
        table_name: 'Source Table'
    };
}

if (state.currentDb === 'pension') {
    const sourceTable = result.source_table || '';
    const isHeir = sourceTable.includes('heir');
    const isFollowUp = sourceTable.includes('follow_up');
    
    // Base fields for all records
    let fieldMap = {
        PensionId: 'Pension ID',
        PUID: t.puid,
        UPN: t.upn,
        PUIDOld1: t.puidOld,
        PUIDOld2: t.puidOld + ' 2'
    };
    
    // Pension holder specific fields
    if (!isHeir) {
        Object.assign(fieldMap, {
            FullName: t.fullName,
            FirstName: t.firstName,
            SecondName: t.secondName,
            ThirdName: t.thirdName,
            LastName: t.lastName,
            Gender: t.gender,
            GenderId: t.gender + ' ID',
            MaritalStatus: t.maritalStatus,
            MaritalStatusId: t.maritalStatus + ' ID',
            PhoneNumber: t.phoneNumber,
            Education: t.education,
            BioMetric: t.bioMetric,
            DocumentNumber: t.documentNumber,
            NationalNumber: t.nationalNumber,
            CivilNumber: t.civilNumber,
            RationalNumber: 'Rational Number',
            Bank: t.bank,
            BankId: t.bank + ' ID',
            Ministry: t.ministry,
            FromMinistry: 'From ' + t.ministry,
            PGDOrganization: t.pgdOrganization,
            OrganizationId: t.pgdOrganization + ' ID',
            PensionPlan: t.pensionPlan,
            PensionPlanType: t.pensionPlan + ' Type',
            PlanId: 'Plan ID',
            PlanTypeId: 'Plan Type ID',
            PensionStatus: t.pensionStatus,
            Status: t.pensionStatus,
            StatusId: t.pensionStatus + ' ID',
            ActiveStatus: 'Active ' + t.pensionStatus,
            Process: 'Process',
            ProcessDate: t.processDate,
            ProcessId: 'Process ID',
            ProcessStatus: 'Process Status',
            ProcessStatusId: 'Process Status ID',
            RetirementType: 'Retirement Type',
            RetirementReason: t.retirementReason,
            ReasonId: 'Reason ID',
            RetirementSalary: t.retirementSalary,
            MonthlyLoan: 'Monthly Loan',
            HeirsCount: t.heirsCount,
            IsSpecial: 'Special',
            RankId: 'Rank ID',
            ResidentLocation: 'Resident Location',
            TerminationReasonId: 'Termination Reason ID'
        });
    }
    
    // Heir specific fields
    if (isHeir) {
        Object.assign(fieldMap, {
            HeirId: 'Heir ID',
            ParentHeirId: 'Parent Heir ID',
            OrganizationId: t.pgdOrganization + ' ID',
            HeirCode: t.heirCode,
            HeirFullName: t.heirFullName,
            HeirMotherName: t.heirMotherName,
            HeirDateOfBirth: t.heirDateOfBirth,
            HeirGender: t.heirGender,
            HeirGenderId: t.heirGender + ' ID',
            HeirRelationshipType: t.heirRelationshipType,
            HeirRelationshipTypeId: t.heirRelationshipType + ' ID',
            HeirValidationDate: 'Validation Date',
            HeirEligibleStartDate: 'Eligible Start Date',
            HeirIsTerminated: t.heirIsTerminated,
            HeirEligibileAmount: t.heirEligibileAmount,
            HeirGrantAmount: 'Grant Amount',
            HeirEligibileAmountString: t.heirEligibileAmount,
            HeirTerminationReason: 'Termination Reason',
            HeirTerminationReasonId: 'Termination Reason ID',
            HeirBank: t.bank,
            HeirBankId: t.bank + ' ID',
            HeirComment: 'Comment',
            HeirAddress: t.heirAddress,
            HeirCivilIdCardNumber: t.heirCivilId,
            HeirBiometricCode: 'Biometric Code',
            HeirUpnCode: t.heirUpnCode,
            HeirNationalIdCardNumber: t.heirNationalId,
            HeirPhoneNumber: t.heirPhoneNumber,
            HeirIsEligible: t.heirIsEligible,
            HeirImageUpload: 'Image Upload Status'
        });
    }
    if (state.currentDb === 'truecaller') {
    return {
        name: t.truecallerName,
        phone: t.phoneNumber
    };
}

if (state.currentDb === 'fib') {
    return {
        displayName: t.fibDisplayName,
        firstName: t.fibFirstName,
        lastName: t.fibLastName,
        englishFirstName: t.fibEnglishFirstName,
        englishLastName: t.fibEnglishLastName,
        phoneNumber: t.fibPhoneNumber
    };
}

if (state.currentDb === 'lawyers') {
    return {
        id: 'ID',
        number: t.lawyerNumber,
        name: t.lawyerName,
        mobile: t.lawyerMobile,
        email: t.lawyerEmail,
        permission: t.lawyerPermission,
        upn_no: t.lawyerUpn,
        update_year: t.lawyerUpdateYear
    };
}
    // Follow-up specific fields
    if (isFollowUp) {
        Object.assign(fieldMap, {
            TargetUser: 'Target User',
            RequesterUser: 'Requester User',
            ToProcess: 'To Process',
            ProcessByUser: 'Processed By',
            ConfigurationId: 'Configuration ID',
            AssignedUserId: 'Assigned User ID',
            Note: 'Note'
        });
    }
    
    return fieldMap;
}


    const fallback = {};
    Object.keys(result).forEach(key => {
        if (!['AttachmentIdRef', 'fam_no'].includes(key)) {
            fallback[key] = key.replace(/fld_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    });
    return fallback;
}

function renderPagination(totalPages) {
    const t = translations[state.language];
    const container = document.getElementById('paginationContainer');
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    if (state.currentPage > 0) {
        const prev = document.createElement('button');
        prev.className = 'pagination-btn terminal-text';
        prev.textContent = t.previous;
        prev.onclick = () => { state.currentPage--; displayResults(); };
        container.appendChild(prev);
    }
    
    const current = document.createElement('button');
    current.className = 'pagination-btn active terminal-text';
    current.textContent = `${t.pageOf} ${state.currentPage + 1}`;
    container.appendChild(current);
    
    if (state.currentPage < totalPages - 1) {
        const next = document.createElement('button');
        next.className = 'pagination-btn terminal-text';
        next.textContent = t.next;
        next.onclick = () => { state.currentPage++; displayResults(); };
        container.appendChild(next);
    }
}

async function viewImage(attachmentId, personType) {

    const t = translations[state.language];
    const modal = document.getElementById('imageModal');
    const container = document.getElementById('imageContainer');
    
    container.innerHTML = `<div class="loading"><div class="loading-spinner"></div><p class="loading-text terminal-text">${t.decryptingImage}...</p></div>`;
    modal.classList.add('active');
    
    try {
        // Get the current personType from state
        
        
        if (!personType) {
            container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">Error: Person type not set</p>`;
            return;
        }
        
        console.log(`🖼️ Requesting ${personType} image: ${attachmentId}`);
        
        const response = await fetch(`${API_URL}/api/image/${attachmentId}?type=${personType}`, {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            container.innerHTML = `
                <div class="code-block terminal-text" style="margin-bottom: 20px;">
                    ${t.attachmentId}: ${attachmentId}<br>
                    ${t.status}: ${t.decrypted}<br>
                    ${t.clearance}: ${t.authorized}
                </div>
                <img src="data:image/jpeg;base64,${data.image}" class="result-image" alt="Biometric ${attachmentId}">
            `;
        } else {
            container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${data.error || t.imageNotFound}</p>`;
        }
    } catch (error) {
        console.error('Image view error:', error);
        container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.decryptionFailed}</p>`;
    }
}

async function viewFamily(famNo) {
    const t = translations[state.language];
    const modal = document.getElementById('familyModal');
    const container = document.getElementById('familyContent');
    
    container.innerHTML = `<div class="loading"><div class="loading-spinner"></div><p class="loading-text terminal-text">${t.accessingFamily}...</p></div>`;
    modal.classList.add('active');
    
    try {
        const response = await fetch(`${API_URL}/api/search/family/${state.currentCity}/${famNo}`, {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            container.innerHTML = `
                <div class="code-block terminal-text" style="margin-bottom: 20px;">
                    ${t.familyUnit}: ${famNo}<br>
                    ${t.totalMembers}: ${data.count}<br>
                    ${t.zone}: ${state.currentCity}
                </div>
            `;
            data.results.forEach((member, i) => {
                container.appendChild(createResultCard(member, i + 1));
            });
        } else {
            container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.noFamilyRecords}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.accessDenied}</p>`;
    }
}

async function viewIraq2022Family(famNo) {
    const t = translations[state.language];
    const modal = document.getElementById('familyModal');
    const container = document.getElementById('familyContent');
    
    container.innerHTML = `<div class="loading"><div class="loading-spinner"></div><p class="loading-text terminal-text">${t.accessingFamily}...</p></div>`;
    modal.classList.add('active');
    
    try {
        const response = await fetch(`${API_URL}/api/search/iraq2022/family/${state.currentProvince}/${famNo}`, {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            container.innerHTML = `
                <div class="code-block terminal-text" style="margin-bottom: 20px;">
                    ${t.familyUnit}: ${famNo}<br>
                    ${t.totalMembers}: ${data.count}<br>
                    ${t.zone}: ${state.currentProvince}
                </div>
            `;
            data.results.forEach((member, i) => {
                container.appendChild(createResultCard(member, i + 1));
            });
        } else {
            container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.noFamilyRecords}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.accessDenied}</p>`;
    }
}

function resetDashboard() {
    state.currentDb = null;
    state.currentCity = null;
    state.currentProvince = null;
    state.currentGovernorate = null;
    state.personType = null;
    state.allFields = {};
    state.results = [];
    state.currentPage = 0;
    
    document.getElementById('homeView')?.classList.add('hidden');
    document.getElementById('databaseSelection').classList.remove('hidden');
    document.getElementById('searchContainer').classList.add('hidden');
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('dbOptions').innerHTML = '';
    document.getElementById('allFieldsGrid').innerHTML = '';
    document.getElementById('navDatabases')?.classList.add('active');
    document.getElementById('navHome')?.classList.remove('active');
    setBreadcrumb('databasesNav');
}

function goHome() {
    state.currentDb = null;
    state.results = [];
    document.getElementById('homeView')?.classList.remove('hidden');
    document.getElementById('databaseSelection').classList.add('hidden');
    document.getElementById('searchContainer').classList.add('hidden');
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('navHome')?.classList.add('active');
    document.getElementById('navDatabases')?.classList.remove('active');
    setBreadcrumb('homeNav');
    renderHomeKpis();
    renderHomeSearchTrend();
}

function setBreadcrumb(translationKey) {
    const crumbEl = document.getElementById('breadcrumbCurrent');
    if (crumbEl) crumbEl.textContent = translations[state.language][translationKey] || translationKey;
}

async function logout() {
    // Stop session checking
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }

    localStorage.removeItem('bcia_user');
    localStorage.removeItem('bcia_language');
    // SECURITY FIX: clear the httpOnly session cookie server-side too.
    try { await fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'same-origin' }); } catch (e) {}
    window.location.href = '/';
}

async function viewLocation(lat, lon, subscriberName, accountNo) {
    const t = translations[state.language];
    const modal = document.getElementById('locationModal');
    const container = document.getElementById('locationContent');
    
    container.innerHTML = `
        <div class="code-block terminal-text" style="margin-bottom: 20px;">
            ${t.subscriberName}: ${subscriberName}<br>
            ${t.accountNo}: ${accountNo}<br>
            ${t.latitude}: ${lat}<br>
            ${t.longitude}: ${lon}<br>
            ${t.status}: ${t.authorized}
        </div>
        <div style="width: 100%; height: 500px; border: 3px solid var(--primary-green); border-radius: 8px; overflow: hidden; box-shadow: 0 0 30px var(--glow-green);">
            <iframe 
                width="100%" 
                height="100%" 
                frameborder="0" 
                style="border:0"
                src="https://www.google.com/maps?q=${lat},${lon}&hl=en&z=18&output=embed"
                allowfullscreen>
            </iframe>
        </div>
    `;
    
    modal.classList.add('active');
}

window.viewImage = viewImage;
window.viewFamily = viewFamily;
window.viewIraq2022Family = viewIraq2022Family;
window.viewLocation = viewLocation;

function changeTheme(theme) {
    document.body.className = 'theme-' + theme;
    localStorage.setItem('bcia-theme', theme);
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('bcia-theme') || 'cyan';
changeTheme(savedTheme);

function exportToCSV() {
    if (state.results.length === 0) return alert('No results to export');
    
    // Create CSV content
    const headers = Object.keys(state.results[0]).filter(key => key !== 'password');
    let csv = headers.join(',') + '\n';
    
    state.results.forEach(row => {
        const values = headers.map(header => {
            const val = row[header] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csv += values.join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${state.currentDb}_export_${Date.now()}.csv`;
    link.click();
    
    // Log activity
    fetch(`${API_URL}/api/activity/log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'EXPORT_CSV',
            details: `Exported ${state.results.length} records from ${state.currentDb}`
        })
    });
    
    state.originalResults = null; // Reset filters
}

function exportSinglePDF(index) {
    const result = state.results[index - 1];
    if (!result) return alert('Record not found');
    
    const t = translations[state.language];
    const fieldMap = getFullFieldMap(result);
    
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Record Export</title>
            <style>
                @page { size: A4; margin: 20mm; }
                body { 
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: ltr;
                    background: white;
                }
                .header {
                    background: linear-gradient(135deg, #14171A 0%, #1F3D30 100%);
                    color: #EDEDEF;
                    padding: 25px;
                    border-left: 6px solid #4FAE84;
                    margin-bottom: 30px;
                    border-radius: 8px;
                }
                .header h1 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }
                .info-box {
                    background: #f8f9fa;
                    border-left: 4px solid #4FAE84;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .info-box div {
                    margin: 8px 0;
                    color: #333;
                }
                .info-box strong {
                    color: #000;
                    font-weight: bold;
                }
                table { 
                    width: 100%;
                    border-collapse: collapse;
                    margin: 25px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                th, td { 
                    border: 1px solid #ddd;
                    padding: 14px 12px;
                    text-align: left;
                    font-size: 13px;
                }
                th {
                    background: #4FAE84;
                    color: #0B0B0D;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                }
                tr:nth-child(even) { 
                    background: #f8f9fa;
                }
                tr:hover {
                    background: #e9ecef;
                }
                .field-name {
                    font-weight: bold;
                    color: #495057;
                    width: 35%;
                }
                .field-value {
                    color: #212529;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #4FAE84;
                    text-align: center;
                    color: #6c757d;
                    font-size: 12px;
                }
                .classification {
                    background: #dc3545;
                    color: white;
                    padding: 8px 20px;
                    display: inline-block;
                    font-weight: bold;
                    border-radius: 20px;
                    margin-top: 10px;
                    font-size: 11px;
                    letter-spacing: 1px;
                }
                @media print {
                    body { background: white; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔒 CLASSIFIED RECORD EXPORT</h1>
                <div style="font-size: 14px; margin-top: 10px; opacity: 0.9;">
                    Intelligence Database System - INTELLIGENCE SYSTEMS
                </div>
            </div>
            
            <div class="info-box">
                <div><strong>Database:</strong> ${getDatabaseTitle().toUpperCase()}</div>
                <div><strong>Record Number:</strong> #${String(index + 1).padStart(6, '0')}</div>
                <div><strong>Export Date:</strong> ${new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</div>
                <div><strong>Exported By:</strong> Agent ${state.user.username.toUpperCase()}</div>
                <div class="classification">⚠️ CLASSIFIED DOCUMENT - CONFIDENTIAL</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (const [key, label] of Object.entries(fieldMap)) {
        let value = result[key];
        if (value !== null && value !== undefined && value !== '' && value !== 'null') {
            // Fix birth year if needed
            if ((key.includes('birth') || key.includes('BIRTH') || key.toLowerCase().includes('birthdate')) && value.toString().length === 6) {
                value = value.toString().substring(0, 4);
            }
            
            html += `
                <tr>
                    <td class="field-name">${label}</td>
                    <td class="field-value">${String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                </tr>
            `;
        }
    }
    
    html += `
                </tbody>
            </table>
            
            <div class="footer">
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">
                    ⚠️ CLASSIFIED DOCUMENT - AUTHORIZED PERSONNEL ONLY
                </div>
                <div>
                    This document contains sensitive intelligence information. 
                    Unauthorized access, distribution, or reproduction is strictly prohibited 
                    and may result in legal action.
                </div>
                <div style="margin-top: 15px; font-size: 11px; color: #adb5bd;">
                    Document ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
                    Classification Level: CONFIDENTIAL | Clearance Required: LEVEL-1 OR HIGHER
                </div>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
    
    fetch(`${API_URL}/api/activity/log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'EXPORT_PDF_SINGLE',
            details: `Exported single record #${index + 1} from ${state.currentDb}`
        })
    });
}

// Load history on startup
document.addEventListener('DOMContentLoaded', () => {
    loadSearchHistory();
});

async function viewFamilyTree(famNo) {
    const modal = document.getElementById('familyTreeModal');
    const container = document.getElementById('familyTreeContent');
    
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading family tree...</p></div>';
    modal.classList.add('active');
    
    try {
        const response = await fetch(`${API_URL}/api/search/family/${state.currentCity}/${famNo}`, {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        if (data.success && data.results.length > 0) {
            renderFamilyTree(data.results, container);
        } else {
            container.innerHTML = '<p style="padding: 20px; color: var(--danger-red);">No family data found</p>';
        }
    } catch (error) {
        container.innerHTML = '<p style="padding: 20px; color: var(--danger-red);">Failed to load family tree</p>';
    }
}

async function viewFamilyTree2022(famNo) {
    const modal = document.getElementById('familyTreeModal');
    const container = document.getElementById('familyTreeContent');
    
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading family tree...</p></div>';
    modal.classList.add('active');
    
    try {
        const response = await fetch(`${API_URL}/api/search/iraq2022/family/${state.currentProvince}/${famNo}`, {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        if (data.success && data.results.length > 0) {
            renderFamilyTree(data.results, container);
        } else {
            container.innerHTML = '<p style="padding: 20px; color: var(--danger-red);">No family data found</p>';
        }
    } catch (error) {
        container.innerHTML = '<p style="padding: 20px; color: var(--danger-red);">Failed to load family tree</p>';
    }
}

function renderFamilyTree(members, container) {
    const t = translations[state.language];
    members.sort((a, b) => {
        const seqA = parseInt(a.seq_no || a.SEQ_NO || 0);
        const seqB = parseInt(b.seq_no || b.SEQ_NO || 0);
        return seqA - seqB;
    });
    
    // Fix birth years for all members
    members.forEach(member => {
        let birth = member.p_birth || member.P_BIRTH || '';
        if (birth && birth.toString().length === 6) {
            member.fixed_birth = birth.toString().substring(0, 4);
        } else {
            member.fixed_birth = birth;
        }
    });
    
    let html = `
        <div style="padding: 30px; overflow-y: auto; height: 100%; background: linear-gradient(135deg, var(--secondary-bg) 0%, var(--primary-bg) 100%);">
            <div style="text-align: center; margin-bottom: 40px;">
                <div style="color: var(--primary-green); font-size: 2rem; font-weight: bold; text-shadow: 0 0 20px var(--glow-green);">
                    ${t.familyTreeVisualization}
                </div>
                <div style="color: var(--text-secondary); font-size: 1.2rem; margin-top: 10px;">
                    FAMILY UNIT: ${members[0].fam_no || members[0].FAM_NO}
                </div>
                <div style="color: var(--text-dim); margin-top: 10px;">
                    Total Members: ${members.length} | Classification: CONFIDENTIAL
                </div>
            </div>
    `;
    
    // Group by generation (relation type)
    const generations = {
        head: [],      // relation 1 (head of family)
        spouse: [],    // relation 2 (spouse)
        children: [],  // relation 3 (children)
        other: []      // other relations
    };
    
    members.forEach(member => {
        const relation = member.p_relation || member.P_RELATION || '0';
        if (relation == '1') generations.head.push(member);
        else if (relation == '2') generations.spouse.push(member);
        else if (relation == '3') generations.children.push(member);
        else generations.other.push(member);
    });
    
    // Render HEAD OF FAMILY
    if (generations.head.length > 0) {
        html += renderGeneration(`${t.headOfFamily}`, generations.head, 'var(--primary-green)', true);
    }
    
    // Connector line
    if (generations.spouse.length > 0) {
        html += '<div style="width: 3px; height: 50px; background: linear-gradient(180deg, var(--primary-green), var(--bright-green)); margin: 0 auto; box-shadow: 0 0 15px var(--glow-green);"></div>';
        html += `<div style="text-align: center; color: var(--primary-green); font-size: 1.2rem; margin: 10px 0;">${t.married}</div>`;
        html += '<div style="width: 3px; height: 50px; background: linear-gradient(180deg, var(--bright-green), var(--primary-green)); margin: 0 auto; box-shadow: 0 0 15px var(--glow-green);"></div>';
    }
    
    // Render SPOUSE
    if (generations.spouse.length > 0) {
        html += renderGeneration(`${t.spouse}`, generations.spouse, 'var(--primary-green)', false);
    }
    
    // Connector to children
    if (generations.children.length > 0) {
        html += '<div style="width: 3px; height: 50px; background: linear-gradient(180deg, var(--primary-green), var(--info)); margin: 0 auto;"></div>';
        html += `<div style="text-align: center; color: var(--primary-green); font-size: 1.2rem; margin: 10px 0;">${t.children}</div>`;
        html += '<div style="width: 3px; height: 50px; background: linear-gradient(180deg, var(--info), var(--primary-green)); margin: 0 auto;"></div>';
    }
    
    // Render CHILDREN (horizontal layout)
    if (generations.children.length > 0) {
        html += `
            <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin: 20px 0;">
        `;
        generations.children.forEach(member => {
            html += renderMemberCard(member, '#00d4ff', false);
        });
        html += '</div>';
    }
    
    // Render OTHER MEMBERS
    if (generations.other.length > 0) {
        html += '<div style="width: 3px; height: 30px; background: var(--text-dim); margin: 20px auto;"></div>';
        html += renderGeneration(`${t.otherMembers}`, generations.other, 'var(--text-dim)', false);
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderGeneration(title, members, color, isHead) {
    let html = `
        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: ${color}; color: #000; padding: 10px 30px; border-radius: 25px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 0 20px ${color};">
                ${title}
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px; align-items: center;">
    `;
    
    members.forEach(member => {
        html += renderMemberCard(member, color, isHead);
    });
    
    html += '</div>';
    return html;
}

function renderMemberCard(member, borderColor, isHead) {
    const t = translations[state.language];
    const name = member.p_first || member.P_FIRST || 'Unknown';
    const father = member.p_father || member.P_FATHER || '';
    const grand = member.p_grand || member.P_GRAND || '';
    const mother = member.p_mother || member.P_MOTHER || '';
    const birth = member.fixed_birth || '';
    const age = birth ? new Date().getFullYear() - parseInt(birth) : '?';
    const relation = member.p_relation || member.P_RELATION || '';
    const job = member.p_job || member.P_JOB || '';
    const idNo = member.ss_id_no || member.SS_ID_NO || '';
    
    const relationText = {
        '1': t.headOfFamily || 'Head of Family',
        '2': t.spouse || 'Spouse',
        '3': t.children || 'Child',
        '4': 'Parent',
        '5': 'Sibling'
    }[relation] || 'Family Member';
    
    // Modern icon instead of emoji
    const icon = relation == '1' ? '▣' : 
                 relation == '2' ? '◈' : 
                 relation == '3' ? '◆' : '●';
    
    return `
        <div style="
            background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.05) 0%, var(--card-bg) 100%);
            border: 3px solid var(--primary-green);
            padding: 25px;
            border-radius: 15px;
            min-width: 450px;
            max-width: 600px;
            position: relative;
            box-shadow: 0 0 30px var(--glow-green), inset 0 0 20px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 0 50px var(--glow-green)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 30px var(--glow-green)';">
            
            ${isHead ? `<div style="position: absolute; top: -15px; left: 20px; background: var(--primary-green); color: var(--primary-bg); padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; box-shadow: 0 0 15px var(--glow-green);">▣ ${relationText.toUpperCase()}</div>` : ''}
            
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 20px; margin-top: ${isHead ? '15px' : '0'};">
                <!-- Icon -->
                <div style="
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, var(--primary-green) 0%, var(--bright-green) 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    box-shadow: 0 0 25px var(--glow-green);
                    border: 3px solid var(--primary-green);
                    color: var(--primary-bg);
                    font-weight: bold;
                ">
                    ${icon}
                </div>
                
                <!-- Info -->
                <div>
                    <div style="color: var(--primary-green); font-size: 1.5rem; font-weight: bold; margin-bottom: 8px; text-shadow: 0 0 10px var(--glow-green);">
                        ${name} ${father}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 1rem; line-height: 1.8;">
                        <div>▸ ${t.father}: <strong>${father} ${grand}</strong></div>
                        <div>▸ ${t.mother}: <strong>${mother || 'N/A'}</strong></div>
                        ${job ? `<div>▸ ${t.job}: <strong>${job}</strong></div>` : ''}
                        ${idNo ? `<div>▸ ID: <strong>${idNo}</strong></div>` : ''}
                    </div>
                    
                    <!-- Stats Bar -->
                    <div style="display: flex; gap: 12px; margin-top: 15px; flex-wrap: wrap;">
                        <div style="background: var(--input-bg); border: 1px solid var(--primary-green); padding: 8px 15px; border-radius: 8px; font-size: 0.9rem;">
                             ${t.age}: <strong style="color: var(--primary-green);">${age}</strong>
                        </div>
                        <div style="background: var(--input-bg); border: 1px solid var(--primary-green); padding: 8px 15px; border-radius: 8px; font-size: 0.9rem;">
                             ${t.birth}: <strong style="color: var(--primary-green);">${birth}</strong>
                        </div>
                        ${!isHead ? `<div style="background: var(--input-bg); border: 1px solid var(--primary-green); padding: 8px 15px; border-radius: 8px; font-size: 0.9rem;">
                            ▸ ${relationText}
                        </div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

document.getElementById('closeFamilyTreeModal')?.addEventListener('click', () => {
    document.getElementById('familyTreeModal').classList.remove('active');
});

window.viewFamilyTree = viewFamilyTree;

async function viewLawyerImage(lawyerId, btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Loading...';

    const t = translations[state.language];
    const modal = document.getElementById('imageModal');
    const container = document.getElementById('imageContainer');

    container.innerHTML = `<div class="loading"><div class="loading-spinner"></div><p class="loading-text terminal-text">${t.decryptingImage}...</p></div>`;
    modal.classList.add('active');

    try {
        const response = await fetch(`${API_URL}/api/lawyers/image/${lawyerId}`, {
            credentials: 'same-origin'
        });
        const data = await response.json();

        btn.textContent = '📷 VIEW PHOTO';
        btn.disabled = false;

        if (data.success) {
            container.innerHTML = `
                <div class="code-block terminal-text" style="margin-bottom: 20px;">
                    ${t.attachmentId}: ${lawyerId}<br>
                    ${t.status}: ${t.decrypted}<br>
                    ${t.clearance}: ${t.authorized}
                </div>
                <img src="data:image/png;base64,${data.image}" class="result-image" alt="Lawyer ${lawyerId}">
            `;
        } else {
            container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${data.error || t.imageNotFound}</p>`;
        }
    } catch (e) {
        btn.textContent = '📷 VIEW PHOTO';
        btn.disabled = false;
        container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.decryptionFailed}</p>`;
    }
}
window.viewLawyerImage = viewLawyerImage;

window.viewFamilyTree2022 = viewFamilyTree2022;

function exportSingleCSV(index) {
    const result = state.results[index - 1];
    if (!result) return alert('Record not found');
    
    const t = translations[state.language];
    const fieldMap = getFullFieldMap(result);
    
    // Create CSV with readable headers
    const readableHeaders = [];
    const values = [];
    
    for (const [key, label] of Object.entries(fieldMap)) {
        let value = result[key];
        if (value !== null && value !== undefined && value !== '' && value !== 'null') {
            readableHeaders.push(label);
            
            // Fix birth year if needed
            if ((key.includes('birth') || key.includes('BIRTH')) && value.toString().length === 6) {
                value = value.toString().substring(0, 4);
            }
            
            values.push(`"${String(value).replace(/"/g, '""')}"`);
        }
    }
    
    let csv = readableHeaders.join(',') + '\n';
    csv += values.join(',') + '\n';
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `record_${index + 1}_${Date.now()}.csv`;
    link.click();
    
    fetch(`${API_URL}/api/activity/log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'EXPORT_CSV_SINGLE',
            details: `Exported single record #${index + 1} from ${state.currentDb}`
        })
    });
}

window.exportSingleCSV = exportSingleCSV;
window.exportSinglePDF = exportSinglePDF;

// Bookmark Functions
async function bookmarkRecord(resultIndex) {
    const t = translations[state.language];
    const record = state.results[resultIndex];
    if (!record) return alert('Record not found');
    
    const note = prompt(t.addNote);
    
    try {
        const response = await fetch(`${API_URL}/api/bookmarks/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                database: state.currentDb,
                record: record,
                note: note || ''
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(t.bookmarkSaved);
            loadBookmarks();
        } else {
            alert(t.bookmarkFailed + ': ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert(t.bookmarkFailed + ': ' + error.message);
    }
}

async function loadBookmarks() {
    try {
        const response = await fetch(`${API_URL}/api/bookmarks`, {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            console.log('Failed to load bookmarks');
            return;
        }
        
        const data = await response.json();
        if (data.success) {
            state.bookmarks = data.bookmarks || [];
            renderHomeKpis();
        }
    } catch (e) {
        console.log('Bookmarks load failed:', e);
    }
}

async function deleteBookmark(bookmarkId) {
    const t = translations[state.language];
    if (!confirm(t.deleteBookmark)) return;
    
    try {
        const response = await fetch(`${API_URL}/api/bookmarks/${bookmarkId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        if (data.success) {
            alert(t.bookmarkDeleted);
            loadBookmarks();
            showBookmarksModal();
        }
    } catch (error) {
        alert('Error deleting bookmark');
    }
}

// Profile Modal Functions
function showProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.add('active');
    showProfileTab('history'); // Show history by default
    
    // Setup tab switching
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'var(--secondary-bg)';
                t.style.borderColor = 'var(--dark-green)';
                t.style.color = 'var(--text-secondary)';
            });
            tab.classList.add('active');
            tab.style.background = 'var(--dark-green)';
            tab.style.borderColor = 'var(--primary-green)';
            tab.style.color = 'var(--primary-green)';
            showProfileTab(tab.dataset.tab);
        });
    });
}

function showProfileTab(tabName) {
    const t = translations[state.language];
    const container = document.getElementById('profileTabContent');
    
    if (tabName === 'history') {
        // Search History Tab
        if (state.searchHistory.length === 0) {
            container.innerHTML = `<p style="color: var(--text-dim); padding: 2rem; text-align: center;">${t.noSearchHistory}</p>`;
        } else {
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: var(--primary-green);">${t.searchHistory} (${state.searchHistory.length})</h3>
                    <button class="btn btn-danger btn-small" onclick="clearSearchHistory()">${t.clearHistory}</button>
                </div>
                ${state.searchHistory.map((item, i) => {
                    const data = JSON.parse(item.search_data);
                    const time = new Date(item.timestamp).toLocaleString();
                    return `
                        <div class="result-card corner-bracket" style="margin-bottom: 15px; cursor: pointer;" onclick="loadHistorySearch(${i})">
                            <div class="result-header">
                                <div><strong>${data.database.toUpperCase()}</strong></div>
                                <div style="font-size: 0.8rem; color: var(--text-dim);">${t.searchedOn}: ${time}</div>
                            </div>
                            <div style="padding: 10px; color: var(--text-secondary); font-size: 0.9rem;">
                                <div style="margin-bottom: 8px;"><strong>Results:</strong> ${data.results_count}</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${Object.entries(data.criteria).map(([key, value]) => 
                                        `<span style="background: var(--input-bg); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; border: 1px solid var(--dark-green);">
                                            <strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}
                                        </span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }
    } else if (tabName === 'bookmarks') {
        // Bookmarks Tab
        if (state.bookmarks.length === 0) {
            container.innerHTML = `<p style="color: var(--text-dim); padding: 2rem; text-align: center;">${t.noBookmarks}</p>`;
        } else {
            container.innerHTML = state.bookmarks.map((bookmark) => {
                const record = JSON.parse(bookmark.record_data);
                const time = new Date(bookmark.timestamp).toLocaleString();
                
                return `
                    <div class="result-card corner-bracket" style="margin-bottom: 15px;">
                        <div class="result-header">
                            <div><strong>${(bookmark.database_name || bookmark.database || 'UNKNOWN').toUpperCase()}</strong></div>
                            <button class="btn btn-danger btn-small" onclick="deleteBookmark(${bookmark.id})" style="padding: 5px 10px; font-size: 0.8rem;">🗑️ ${t.delete}</button>
                        </div>
                        <div style="padding: 10px; color: var(--text-secondary); font-size: 0.9rem;">
                            ${bookmark.note ? `<div style="color: var(--primary-green); margin-bottom: 10px;">📝 ${t.note}: ${escapeHtml(bookmark.note)}</div>` : ''}
                            <div style="font-size: 0.8rem; color: var(--text-dim);">${t.saved}: ${time}</div>
                        </div>
                        <div class="result-fields-grid" style="max-height: 200px; overflow-y: auto;">
                            ${Object.entries(record).slice(0, 8).map(([key, value]) => {
                                if (value && value !== 'null' && key !== 'password') {
                                    return `
                                        <div class="result-field">
                                            <span class="field-label">${key}</span>
                                            <span class="field-value">${String(value).substring(0, 50)}</span>
                                        </div>
                                    `;
                                }
                                return '';
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } else if (tabName === 'password') {
        // Change Password Tab
        container.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto;">
                <h3 style="color: var(--primary-green); margin-bottom: 20px;">${t.changePassword}</h3>
                
                <div id="passwordChangeAlert"></div>
                
                <form id="changePasswordForm" onsubmit="changePassword(event)">
                    <div class="form-group">
                        <label>${t.oldPassword}</label>
                        <input type="password" id="oldPassword" required style="width: 100%; padding: 12px; background: var(--input-bg); border: 1px solid var(--dark-green); color: var(--primary-green); border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                        <label>${t.newPassword}</label>
                        <input type="password" id="newPassword" required style="width: 100%; padding: 12px; background: var(--input-bg); border: 1px solid var(--dark-green); color: var(--primary-green); border-radius: 6px;">
                        <small style="color: var(--text-dim); font-size: 0.75rem; display: block; margin-top: 5px;">
                            Minimum 12 characters with uppercase, lowercase, numbers, and symbols
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label>${t.confirmNewPassword}</label>
                        <input type="password" id="confirmNewPassword" required style="width: 100%; padding: 12px; background: var(--input-bg); border: 1px solid var(--dark-green); color: var(--primary-green); border-radius: 6px;">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                        🔑 ${t.changePassword}
                    </button>
                </form>
            </div>
        `;
    }
}

async function changePassword(event) {
    event.preventDefault();
    const t = translations[state.language];
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const alertDiv = document.getElementById('passwordChangeAlert');
    
    // Validation
    if (newPassword !== confirmNewPassword) {
        alertDiv.innerHTML = '<div class="alert alert-error">⚠️ Passwords do not match</div>';
        return;
    }
    
    if (newPassword.length < 12) {
        alertDiv.innerHTML = '<div class="alert alert-error">⚠️ Password must be at least 12 characters</div>';
        return;
    }
    
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || 
        !/[0-9]/.test(newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        alertDiv.innerHTML = '<div class="alert alert-error">⚠️ Password must include uppercase, lowercase, numbers, and symbols</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alertDiv.innerHTML = `<div class="alert alert-success">${t.passwordChanged}</div>`;
            document.getElementById('changePasswordForm').reset();
            
            // Auto-close alert after 3 seconds
            setTimeout(() => {
                alertDiv.innerHTML = '';
            }, 3000);
        } else {
            alertDiv.innerHTML = `<div class="alert alert-error">${data.error || t.passwordChangeFailed}</div>`;
        }
    } catch (error) {
        alertDiv.innerHTML = `<div class="alert alert-error">${t.passwordChangeFailed}: ${error.message}</div>`;
    }
}



window.showProfileModal = showProfileModal;
window.changePassword = changePassword;
window.clearSearchHistory = clearSearchHistory;
window.bookmarkRecord = bookmarkRecord;
window.deleteBookmark = deleteBookmark;
function showBookmarksModal() {
    showProfileModal();
    setTimeout(() => {
        const bookmarksTab = document.querySelector('.profile-tab[data-tab="bookmarks"]');
        if (bookmarksTab) bookmarksTab.click();
    }, 100);
}
window.showBookmarksModal = showBookmarksModal;

// Load bookmarks on startup
document.addEventListener('DOMContentLoaded', () => {
    loadBookmarks();
});


// View all heirs for a pension
async function viewPensionHeirs(pensionId) {
    const t = translations[state.language];
    const modal = document.getElementById('familyModal');
    const container = document.getElementById('familyContent');
    
    container.innerHTML = `<div class="loading"><div class="loading-spinner"></div><p class="loading-text terminal-text">${t.accessingFamily}...</p></div>`;
    modal.classList.add('active');
    
    try {
        const db = dbPools.pension.getConnection();
        const tables = ['heirs', 'follow_up_heirs'];
        let allHeirs = [];
        let completed = 0;
        
        tables.forEach(table => {
            const sql = `SELECT *, '${table}' as source_table FROM [${table}] WHERE PensionId = ? LIMIT 50`;
            
            fetch(`${API_URL}/api/pension/heirs/${pensionId}`, {
                credentials: 'same-origin'
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.heirs) {
                    allHeirs.push(...data.heirs);
                }
                completed++;
                
                if (completed === tables.length) {
                    if (allHeirs.length === 0) {
                        container.innerHTML = `<p class="terminal-text" style="color: var(--text-dim); padding: 2rem; text-align: center;">${t.noFamilyRecords}</p>`;
                    } else {
                        container.innerHTML = `
                            <div class="code-block terminal-text" style="margin-bottom: 20px;">
                                ${t.familyUnit}: ${pensionId}<br>
                                ${t.totalMembers}: ${allHeirs.length}
                            </div>
                        `;
                        allHeirs.forEach((heir, i) => {
                            container.appendChild(createResultCard(heir, i + 1));
                        });
                    }
                }
            });
        });
        
    } catch (error) {
        container.innerHTML = `<p class="terminal-text" style="color: var(--danger-red);">${t.accessDenied}</p>`;
    }
}

window.viewPensionHeirs = viewPensionHeirs;