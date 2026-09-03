export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    badge_saas: "SaaS Multi-Tenant • Cameroun & Afrique",
    hero_headline_1: "Plateforme complète de gestion pour",
    hero_headline_highlight: "Écoles Publiques et Privées",
    hero_subtext: "L'école sait toujours qui doit quoi. Le parent sait toujours ce qu'il doit payer.",
    hero_btn_register: "Inscrire mon Établissement (Essai 14j)",
    hero_btn_dashboards: "Explorer la Démo Interactive",

    nav_brand: "Scolyva",
    nav_home: "Accueil",
    nav_features: "Fonctionnalités",
    nav_pricing: "Abonnements",
    nav_demo: "Démo Rapide",
    nav_login: "Se Connecter",
    nav_register: "Inscrire mon Établissement",

    // Features Section
    feat_title: "Une solution clé en main taillée pour les réalités camerounaises",
    feat_subtitle: "Découvrez la puissance d'une gestion centralisée pour directeurs, comptables, enseignants et parents.",
    feat_1_title: "Frais de Scolarité & Mobile Money (CinetPay)",
    feat_1_desc: "Suivi automatisé du solde par élève. Paiement direct par les parents via Orange Money et MTN MoMo. Reçus officiels générés instantanément.",
    feat_2_title: "Double Système Éducatif (FR / EN)",
    feat_2_desc: "Prise en charge native du système Francophone (6e → Terminale) et Anglophone (Form 1 → Upper Sixth). Calcul automatique des moyennes pondérées par coefficients.",
    feat_3_title: "Isolation Multi-Tenant Serveur",
    feat_3_desc: "Une seule plateforme hébergeant chaque école de manière totalement isolée. Période d'essai automatique de 14 jours avec bascule sécurisée en lecture seule sans perte de données.",

    // Password Security & Registration
    reg_modal_title: "Inscrire mon Établissement Scolaire",
    reg_modal_subtitle: "Bénéficiez immédiatement de 14 jours d'essai gratuit sans engagement.",
    label_school_name: "Nom de l'établissement",
    label_city: "Ville",
    label_school_phone: "Téléphone de l'école",
    label_edu_system: "Système Éducatif",
    label_director_name: "Nom du Directeur",
    label_school_email: "Email de l'école",
    label_admin_fname: "Prénom de l'Administrateur",
    label_admin_lname: "Nom de l'Administrateur",
    label_password: "Mot de passe de votre compte",
    label_confirm_password: "Confirmer le mot de passe",
    err_password_mismatch: "⚠️ Les deux mots de passe ne concordent pas.",
    btn_start_trial: "Activer l'essai gratuit 14 jours",

    // Trial Banner
    trial_active_banner: "Période d'essai gratuite active : {days} jours restants. Profitez de toutes les fonctionnalités !",
    trial_expired_banner: "⚠️ Période d'essai expirée — Votre établissement est en mode LECTURE SEULE. Seule la consultation des données est autorisée.",
    upgrade_now: "Souscrire un Abonnement (Mobile Money / CinetPay)",
    readonly_badge: "Lecture Seule",

    // Roles
    role_superadmin: "Super Admin Plateforme",
    role_school_admin: "Directeur / Admin École",
    role_accountant: "Comptable / Intendant",
    role_teacher: "Enseignant",
    role_parent: "Parent d'Élève",
    role_student: "Élève",

    // Dashboard Titles & Subtitles
    dash_school_name: "Collège Excellence Douala",
    dash_title_admin: "Espace Administration Établissement",
    dash_title_superadmin: "Super Admin Platform Overview",
    dash_title_accountant: "Comptabilité & Recouvrement des Frais",
    dash_title_teacher: "Portail Enseignant (Notes & Présences)",
    dash_title_parent: "Espace Parent (Suivi Enfants & Paiement)",
    dash_title_student: "Mon Dossier Scolaire & Assiduité",

    // Stats
    stat_students: "Élèves Inscrits",
    stat_collected: "Frais Encaissés",
    stat_remaining: "Impayés / Reste à recouvrer",
    stat_rate: "Taux de Recouvrement",
    stat_avg: "Moyenne Générale Classe",

    // Actions & Buttons
    btn_save: "Enregistrer les Modifications",
    btn_cancel: "Annuler",
    btn_pay_cinetpay: "Payer via Mobile Money (Orange / MTN)",
    btn_generate_bulletins: "Générer les Bulletins de Séquence",
    btn_take_attendance: "Faire l'Appel de la Classe",
    btn_add_student: "Inscrire un Élève",
    btn_add_grade: "Saisir les Notes de Séquence",
    btn_close: "Fermer",

    // Educational Systems
    sys_francophone: "Système Francophone (6e → Terminale)",
    sys_anglophone: "Anglophone System (Form 1 → Upper Sixth)",
    sys_both: "Établissement Bilingue",
  },

  en: {
    badge_saas: "Multi-Tenant SaaS • Cameroon & Africa",
    hero_headline_1: "Complete management platform for",
    hero_headline_highlight: "Public and Private Schools",
    hero_subtext: "The school always knows who owes what. The parent always knows what to pay.",
    hero_btn_register: "Register My School (14-Day Trial)",
    hero_btn_dashboards: "Explore Interactive Demo",

    nav_brand: "Scolyva",
    nav_home: "Home",
    nav_features: "Features",
    nav_pricing: "Pricing",
    nav_demo: "Quick Demo",
    nav_login: "Log In",
    nav_register: "Register My School",

    // Features Section
    feat_title: "A turnkey solution built for African educational realities",
    feat_subtitle: "Discover the power of centralized management for directors, bursars, teachers, and parents.",
    feat_1_title: "Tuition Fees & Mobile Money (CinetPay)",
    feat_1_desc: "Automated student balance tracking. Direct payment by parents via Orange Money and MTN MoMo. Instant official receipts.",
    feat_2_title: "Dual Educational System (FR / EN)",
    feat_2_desc: "Native support for Francophone (6th → Terminale) and Anglophone (Form 1 → Upper Sixth). Automatic coefficient weighted average calculations.",
    feat_3_title: "Strict Server Multi-Tenant Isolation",
    feat_3_desc: "Single platform hosting every school completely isolated. Automatic 14-day trial with safe read-only fallback without data loss.",

    // Password Security & Registration
    reg_modal_title: "Register My School",
    reg_modal_subtitle: "Enjoy an instant 14-day free trial with no commitment.",
    label_school_name: "School Name",
    label_city: "City",
    label_school_phone: "School Phone",
    label_edu_system: "Educational System",
    label_director_name: "Director's Name",
    label_school_email: "School Email",
    label_admin_fname: "Administrator First Name",
    label_admin_lname: "Administrator Last Name",
    label_password: "Account Password",
    label_confirm_password: "Confirm Password",
    err_password_mismatch: "⚠️ Passwords do not match.",
    btn_start_trial: "Activate 14-Day Free Trial",

    // Trial Banner
    trial_active_banner: "Free trial active: {days} days remaining. Enjoy all features!",
    trial_expired_banner: "⚠️ Trial period expired — Your school is in READ-ONLY mode. Only data consultation is allowed.",
    upgrade_now: "Subscribe Now (Mobile Money / CinetPay)",
    readonly_badge: "Read Only",

    // Roles
    role_superadmin: "Platform Super Admin",
    role_school_admin: "School Director / Admin",
    role_accountant: "Accountant / Bursar",
    role_teacher: "Teacher",
    role_parent: "Parent",
    role_student: "Student",

    // Dashboard Titles & Subtitles
    dash_school_name: "St. Patrick International College",
    dash_title_admin: "School Administration Portal",
    dash_title_superadmin: "Platform Super Admin Overview",
    dash_title_accountant: "Bursar & Debt Recovery Portal",
    dash_title_teacher: "Teacher Portal (Grades & Attendance)",
    dash_title_parent: "Parent Portal (Child Overview & Payment)",
    dash_title_student: "My Academic Record & Attendance",

    // Stats
    stat_students: "Enrolled Students",
    stat_collected: "Fees Collected",
    stat_remaining: "Outstanding Debt",
    stat_rate: "Collection Rate",
    stat_avg: "Class Average",

    // Actions & Buttons
    btn_save: "Save Changes",
    btn_cancel: "Cancel",
    btn_pay_cinetpay: "Pay via Mobile Money (Orange / MTN)",
    btn_generate_bulletins: "Generate Sequence Report Cards",
    btn_take_attendance: "Take Class Attendance",
    btn_add_student: "Enroll Student",
    btn_add_grade: "Enter Sequence Grades",
    btn_close: "Close",

    // Educational Systems
    sys_francophone: "Francophone System (6th -> Terminale)",
    sys_anglophone: "Anglophone System (Form 1 -> Upper Sixth)",
    sys_both: "Bilingual School",
  }
};
