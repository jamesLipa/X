 /* =========================================================
   JAMES LIPA / GLOBAL COMMUNITY
   ACCOUNT DASHBOARD — AUTH SESSION
   ========================================================= */


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */


const SUPABASE_URL = "https://aeitclyvrbdgxreclxhh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_wLGFQlOtL5gcAkokPZtTRQ_C6cZ0x99";


const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);



const authTabs = document.querySelectorAll(".auth-tab");

/* =========================================================
   ELEMENTOS DEL DASHBOARD
   ========================================================= */

const welcomeName =
  document.getElementById("welcomeName");

const topUserName =
  document.getElementById("topUserName");

const userAvatar =
  document.getElementById("userAvatar");

const logoutButton =
  document.getElementById("logoutButton");

/* =========================================================
   CURRENT USER / PROJECT
   ========================================================= */

let currentUser = null;
let currentProject = null; 
let mission02Completed = false;

/* =========================================================
   APARIENCIA · THEME ENGINE
   ========================================================= */

const THEME_STORAGE_KEY = "jl-dashboard-theme";

const themeToggle =
  document.getElementById("themeToggle");

const themeModeLabel =
  document.getElementById("themeModeLabel");

const themeColorMeta =
  document.querySelector('meta[name="theme-color"]');


function applyDashboardTheme(theme) {

  const selectedTheme =
    theme === "champagne"
      ? "champagne"
      : "dark";


  /* Aplicar tema al documento */

  document.documentElement.dataset.theme =
    selectedTheme;


  /* Sincronizar switch */

  if (themeToggle) {

    themeToggle.checked =
      selectedTheme === "champagne";

  }


  /* Actualizar etiqueta */

  if (themeModeLabel) {

    themeModeLabel.textContent =
      selectedTheme === "champagne"
        ? "Champagne"
        : "Oscuro";

  }


  /* Color del navegador */

  if (themeColorMeta) {

    themeColorMeta.setAttribute(
      "content",
      selectedTheme === "champagne"
        ? "#f4efe5"
        : "#050505"
    );

  }

}


function initializeDashboardTheme() {

  let savedTheme = null;

  try {

    savedTheme =
      localStorage.getItem(
        THEME_STORAGE_KEY
      );

  }

  catch (error) {

    console.warn(
      "No se pudo leer la preferencia de apariencia:",
      error
    );

  }


  applyDashboardTheme(savedTheme);


  if (!themeToggle) {
    return;
  }


  themeToggle.addEventListener(
    "change",
    () => {

      const nextTheme =
        themeToggle.checked
          ? "champagne"
          : "dark";


      applyDashboardTheme(nextTheme);


      try {

        localStorage.setItem(
          THEME_STORAGE_KEY,
          nextTheme
        );

      }

      catch (error) {

        console.warn(
          "No se pudo guardar la preferencia de apariencia:",
          error
        );

      }

    }
  );

}


/* Inicializar apariencia */

initializeDashboardTheme();

/* =========================================================
   XP PROGRESS · RENDER CENTRAL
   ========================================================= */

function renderXPProgress() {

  const totalXP =
    document.getElementById("totalXP");

  const xpProgressText =
    document.getElementById("xpProgressText");

  const xpFill =
    document.getElementById("xpFill");

  const projectViewXP =
    document.getElementById("projectViewXP");


  const xp =
    Math.max(
      0,
      Number(currentProject?.xp || 0)
    );


  /* MVP:
     LEVEL 2 se desbloquea en 1000 XP
  */

  const nextLevelXP = 1000;

  const progressPercent =
    Math.min(
      100,
      (xp / nextLevelXP) * 100
    );


  /* XP principal */

  if (totalXP) {
    totalXP.textContent = xp;
  }


  /* Texto de progreso */

  if (xpProgressText) {
    xpProgressText.textContent =
      `${xp} / ${nextLevelXP} XP`;
  }


  /* Barra */

  if (xpFill) {
    xpFill.style.width =
      `${progressPercent}%`;
  }


  /* XP dentro de Mi Proyecto */

  if (projectViewXP) {
    projectViewXP.textContent =
      `${xp} XP`;
  }

}

/* =========================================================
   CARGAR PROYECTO ACTUAL
   ========================================================= */

async function loadCurrentProject() {
  
  if (!currentUser) {
    return;
  }

  const {
    data: project,
    error
  } = await supabaseClient
    .from("projects")
    .select(`
      id,
      name,
      category_id,
      stage,
      xp,
      level,
      created_at,
      updated_at
    `)
    .eq("user_id", currentUser.id)
    .order("created_at", {
      ascending: true
    })
    .limit(1)
    .maybeSingle();


  if (error) {

    console.error(
      "Error cargando proyecto:",
      error
    );

    return;

  }


  /* Usuario todavía no tiene proyecto */

  if (!project) {

    currentProject = null;

    console.log(
      "El usuario todavía no tiene proyecto."
    );

    return;

  }


  /* Guardar proyecto en memoria */

  currentProject = project;


  /* =======================================================
     RELLENAR FORMULARIO
     ======================================================= */

  const projectNameInput =
    document.getElementById("projectName");

  const projectCategorySelect =
    document.getElementById("projectCategorySelect");

  const projectStageSelect =
    document.getElementById("projectStage");


  if (projectNameInput) {

    projectNameInput.value =
      project.name || "";

  }


  if (
    projectCategorySelect &&
    project.category_id
  ) {

    projectCategorySelect.value =
      project.category_id;

  }


  if (
    projectStageSelect &&
    project.stage
  ) {

    projectStageSelect.value =
      project.stage;

  }


  /* =======================================================
     RESUMEN
     ======================================================= */

  const projectViewCategory =
    document.getElementById(
      "projectViewCategory"
    );

  const projectViewStage =
    document.getElementById(
      "projectViewStage"
    );

  const projectViewLevel =
    document.getElementById(
      "projectViewLevel"
    );

  const projectViewXP =
    document.getElementById(
      "projectViewXP"
    );


  /* Categoría */

  if (projectViewCategory) {

    const selectedOption =
      projectCategorySelect
        ?.options[
          projectCategorySelect.selectedIndex
        ];

    projectViewCategory.textContent =
      selectedOption &&
      projectCategorySelect.value
        ? selectedOption.textContent.trim()
        : "Sin seleccionar";

  }


  /* Etapa */

  if (projectViewStage) {

    const selectedStage =
      projectStageSelect
        ?.options[
          projectStageSelect.selectedIndex
        ];

    projectViewStage.textContent =
      selectedStage
        ? selectedStage.textContent.trim()
        : "Idea";

  }


  /* Level */

  if (projectViewLevel) {

    projectViewLevel.textContent =
      `LEVEL ${project.level || 1}`;

  }


  /* XP */

renderXPProgress();


  /* Estado de guardado */

  if (projectSaveStatus) {

    projectSaveStatus.textContent =
      "GUARDADO ✓";

    projectSaveStatus.classList.add(
      "saved"
    );

  }


  console.log(
    "Proyecto cargado:",
    currentProject
  );

}
/* =========================================================
   MISIÓN 01 · CARGAR EVIDENCIA EXISTENTE
   ========================================================= */

async function loadMission01Evidence() {

  if (!currentUser || !currentProject) {
    return;
  }

  try {

    const {
      data: evidence,
      error
    } = await supabaseClient
      .from("project_evidence")
      .select(`
        id,
        file_name,
        file_type,
        file_size,
        storage_path,
        created_at
      `)
      .eq("user_id", currentUser.id)
      .eq("project_id", currentProject.id)
      .eq("mission_key", "mission-01")
      .order("created_at", {
        ascending: false
      })
      .limit(1)
      .maybeSingle();


    if (error) {
      throw error;
    }


    /* Todavía no existe evidencia */

    if (!evidence) {

      console.log(
        "Misión 01 todavía no tiene evidencia."
      );

      return;
    }


    /* Evidencia encontrada */

    console.log(
      "Evidencia Misión 01 cargada:",
      evidence
    );


    /* Actualizar estado visual */

    if (uploadEvidenceButton) {

      uploadEvidenceButton.textContent =
        "EVIDENCIA REGISTRADA ✓";

      uploadEvidenceButton.disabled = true;

    }


    const evidenceStatus =
      document.getElementById("evidenceStatus");

    if (evidenceStatus) {

      evidenceStatus.textContent =
        "EVIDENCIA REGISTRADA ✓";

      evidenceStatus.classList.add(
        "completed"
      );

    }


    /* Mostrar archivo registrado */

    if (evidenceFileName) {

      evidenceFileName.textContent =
        evidence.file_name;

    }

    if (evidenceFileSize) {

  const sizeMB =
    evidence.file_size / (1024 * 1024);

  evidenceFileSize.textContent =
    sizeMB < 1
      ? `${Math.ceil(evidence.file_size / 1024)} KB`
      : `${sizeMB.toFixed(1)} MB`;

}

    if (
      evidenceSelectedFile &&
      evidence.file_name
    ) {

      evidenceSelectedFile.hidden = false;

    }

  }

  catch (error) {

    console.error(
      "Error cargando evidencia de Misión 01:",
      error
    );

  }

}

/* =========================================================
   MISIÓN 02 · CARGAR RESPUESTAS GUARDADAS
   ========================================================= */

async function loadMission02Responses() {

  if (!currentUser || !currentProject) {
    return;
  }

  try {

    const {
      data: response,
      error
    } = await supabaseClient
      .from("mission_responses")
      .select(`
        id,
        mission_key,
        answers,
        created_at,
        updated_at
      `)
      .eq("user_id", currentUser.id)
      .eq("project_id", currentProject.id)
      .eq("mission_key", "mission-02")
      .maybeSingle();


    if (error) {
      throw error;
    }


    /* Todavía no existen respuestas */

    if (!response) {

      console.log(
        "Mission 02 todavía no tiene respuestas."
      );

      return;
    }


    console.log(
      "Respuestas Mission 02 cargadas:",
      response
    );


    /* Recuperar campos del formulario */

    const mission02What =
      document.getElementById("mission02What");

    const mission02Who =
      document.getElementById("mission02Who");

    const mission02Problem =
      document.getElementById("mission02Problem");

    const completeMission02 =
      document.getElementById("completeMission02");


    /* Restaurar respuestas */

    if (mission02What) {
      mission02What.value =
        response.answers?.what || "";
    }

    if (mission02Who) {
      mission02Who.value =
        response.answers?.who || "";
    }

    if (mission02Problem) {
      mission02Problem.value =
        response.answers?.problem || "";
    }


    /* Estado visual */

    if (completeMission02) {

      completeMission02.innerHTML =
        `RESPUESTAS GUARDADAS ✓`;

      completeMission02.disabled = false;

    }

  }

  catch (error) {

    console.error(
      "Error cargando respuestas Mission 02:",
      error
    );

  }

}

/* =========================================================
   MISIÓN 02 · CARGAR ESTADO REAL
   ========================================================= */

async function loadMission02Status() {

  if (!currentUser || !currentProject) {
    return;
  }

  try {

    const {
      data: userMission,
      error
    } = await supabaseClient
      .from("user_missions")
      .select(`
        status,
        completed_at,
        missions!inner (
          mission_key,
          title,
          xp_reward
        )
      `)
      .eq("user_id", currentUser.id)
      .eq("project_id", currentProject.id)
      .eq("missions.mission_key", "mission-02")
      .maybeSingle();


    if (error) {
      throw error;
    }


    if (!userMission) {

      console.log(
        "Mission 02 todavía no tiene estado."
      );

      return;
    }


    console.log(
      "Estado Mission 02:",
      userMission
    );


    if (userMission.status === "completed") {
      
      mission02Completed = true;

      console.log(
        "Mission 02 confirmada como COMPLETADA ✓"
      );

      /* =============================================
   INICIO · SIGUIENTE MISIÓN DINÁMICA
   ============================================= */

const homeNextMissionNumber =
  document.getElementById("homeNextMissionNumber");

const homeNextMissionTitle =
  document.getElementById("homeNextMissionTitle");

const homeNextMissionDescription =
  document.getElementById("homeNextMissionDescription");


if (homeNextMissionNumber) {
  homeNextMissionNumber.textContent = "03";
}

if (homeNextMissionTitle) {
  homeNextMissionTitle.textContent =
    "Dale identidad a tu proyecto.";
}

if (homeNextMissionDescription) {
  homeNextMissionDescription.textContent =
    "Define cómo quieres que tu proyecto sea reconocido, recordado y explicado por otras personas.";
}

/* =============================================
   MISIONES · MISIÓN ACTUAL DINÁMICA
   ============================================= */

const missionsCurrentMissionNumber =
  document.getElementById("missionsCurrentMissionNumber");

const missionsCurrentMissionTitle =
  document.getElementById("missionsCurrentMissionTitle");

const missionsCurrentMissionDescription =
  document.getElementById("missionsCurrentMissionDescription");


if (missionsCurrentMissionNumber) {
  missionsCurrentMissionNumber.textContent = "03";
}

if (missionsCurrentMissionTitle) {
  missionsCurrentMissionTitle.textContent =
    "Dale identidad a tu proyecto.";
}

if (missionsCurrentMissionDescription) {
  missionsCurrentMissionDescription.textContent =
    "Define cómo quieres que tu proyecto sea reconocido, recordado y explicado por otras personas.";
}

      /* =============================================
         INICIO · RUTA
         ============================================= */

      const homeMissionCounter =
        document.getElementById("homeMissionCounter");

      const homeMission02Step =
        document.getElementById("homeMission02Step");

      const homeMission02Node =
        document.getElementById("homeMission02Node");

      const homeMission02Line =
        document.getElementById("homeMission02Line");

      const homeMission03Step =
        document.getElementById("homeMission03Step");

      const homeMission03Node =
        document.getElementById("homeMission03Node");


      if (homeMissionCounter) {
        homeMissionCounter.textContent = "2 / 3";
      }


      if (homeMission02Step) {
        homeMission02Step.classList.remove("current");
        homeMission02Step.classList.add("completed");
      }


      if (homeMission02Node) {
        homeMission02Node.textContent = "✓";
      }


      if (homeMission02Line) {
        homeMission02Line.classList.add("completed");
      }


      if (homeMission03Step) {
        homeMission03Step.classList.remove("locked");
        homeMission03Step.classList.add("current");
      }


      if (homeMission03Node) {
        homeMission03Node.textContent = "03";
      }


      /* =============================================
         MISIONES · RUTA
         ============================================= */

      const missionsMissionCounter =
        document.getElementById(
          "missionsMissionCounter"
        );

      const missionsMission02Step =
        document.getElementById(
          "missionsMission02Step"
        );

      const missionsMission02Node =
        document.getElementById(
          "missionsMission02Node"
        );

      const missionsMission02Line =
        document.getElementById(
          "missionsMission02Line"
        );

      const missionsMission03Step =
        document.getElementById(
          "missionsMission03Step"
        );

      const missionsMission03Node =
        document.getElementById(
          "missionsMission03Node"
        );


      if (missionsMissionCounter) {
        missionsMissionCounter.textContent = "2 / 3";
      }


      if (missionsMission02Step) {
        missionsMission02Step.classList.remove(
          "current"
        );

        missionsMission02Step.classList.add(
          "completed"
        );
      }


      if (missionsMission02Node) {
        missionsMission02Node.textContent = "✓";
      }


      if (missionsMission02Line) {
        missionsMission02Line.classList.add(
          "completed"
        );
      }


      if (missionsMission03Step) {
        missionsMission03Step.classList.remove(
          "locked"
        );

        missionsMission03Step.classList.add(
          "current"
        );
      }


      if (missionsMission03Node) {
        missionsMission03Node.textContent = "03";
      }


      /* =============================================
         FORMULARIO MISIÓN 02
         ============================================= */

      const mission02Status =
        document.getElementById("mission02Status");

      const completeMission02 =
        document.getElementById("completeMission02");


      if (mission02Status) {

        mission02Status.textContent =
          "COMPLETADA ✓";

        mission02Status.classList.add(
          "saved"
        );
      }


      if (completeMission02) {

        completeMission02.innerHTML =
          `MISIÓN COMPLETADA ✓`;

        completeMission02.disabled = true;
      }

 /* =============================================
   CERRAR MISIÓN 02 COMPLETADA
   ============================================= */

const completeMission02Panel =
  document.getElementById("mission02Panel");

if (completeMission02Panel) {

  completeMission02Panel.hidden = true;

  completeMission02Panel.style.display = "none";

}

}

}
  catch (error) {

    console.error(
      "Error cargando estado Mission 02:",
      error
    );

  }

}

/* =========================================================
   INICIAR DASHBOARD
   ========================================================= */
async function initializeDashboard(){

  try{

    /*
      Obtenemos la sesión actual.
    */

    const {
      data: { session },
      error
    } = await supabaseClient.auth.getSession();


    if(error){
      throw error;
    }


    /*
      PROTECCIÓN:
      Si no existe sesión, no permitimos usar el dashboard.
    */

    if(!session){

      window.location.replace("login.html");

      return;
    }


    /*
      Usuario autenticado
    */

    const user = session.user;
    currentUser = user;


    /*
      Nombre guardado cuando hicimos signUp:
      options.data.name
    */

  /* =======================================================
   PERFIL DEL USUARIO
   Compatible con:
   - Email / Password
   - Google OAuth
   ======================================================= */

const metadata =
  user.user_metadata || {};

const fullName =
  metadata.full_name ||
  metadata.name ||
  [
    metadata.given_name,
    metadata.family_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
  user.email?.split("@")[0] ||
  "Usuario";

updateUserInterface(
  fullName,
  user.email
);


/* =======================================================
   PRIVATE ACCESS · VERIFICAR PLAN
   ======================================================= */

const hasPrivateAccess =
  await checkUserAccess();


/*
  Si Supabase NO confirma:

  payment_status = paid
  access_status  = active

  detenemos aquí la carga del dashboard.
*/

if (!hasPrivateAccess) {

  console.log(
    "Dashboard bloqueado: Private Access requerido."
  );

  return;
}


/* =======================================================
   ACCESO CONFIRMADO · CARGAR DASHBOARD
   ======================================================= */

await loadProjectCategories();

await loadCurrentProject();

await loadMission01Evidence();

await loadMission02Responses();

await loadMission02Status();  

await loadMission03();
await loadMission04Status();

 
  }catch(error){

    console.error(
      "Error al cargar la sesión:",
      error
    );

    window.location.replace("login.html");

  }

}


/* =========================================================
   ACTUALIZAR INTERFAZ DEL USUARIO
   ========================================================= */

function updateUserInterface(
  fullName,
  email
){

  /*
    Primer nombre para el saludo
  */

  const firstName =
    fullName
      .trim()
      .split(/\s+/)[0];


  if(welcomeName){

    welcomeName.textContent =
      firstName;

  }


  if(topUserName){

    topUserName.textContent =
      fullName;

  }


  /*
    Generamos iniciales automáticamente.

    Ejemplo:
    James Sandoval → JS
  */

  if(userAvatar){

    const initials =
      fullName
        .trim()
        .split(/\s+/)
        .slice(0,2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();


    userAvatar.textContent =
      initials || "JL";


    /*
      Tooltip con correo.
    */

    if(email){

      userAvatar.title = email;

    }

  }

}


/* =========================================================
   CERRAR SESIÓN
   ========================================================= */

if(logoutButton){

  logoutButton.addEventListener(
    "click",
    async () => {

      logoutButton.disabled = true;


      try{

        const { error } =
          await supabaseClient.auth.signOut();


        if(error){
          throw error;
        }


        window.location.replace(
          "login.html"
        );


      }catch(error){

        console.error(
          "Error al cerrar sesión:",
          error
        );


        logoutButton.disabled = false;

      }

    }
  );

}


/* =========================================================
   INICIAR
   ========================================================= */
/* =========================================================
   PROJECT CATEGORIES
   ========================================================= */

async function loadProjectCategories() {

  const categorySelect = document.getElementById(
    "projectCategorySelect"
  );

  if (!categorySelect) {
    return;
  }

  const { data: categories, error } = await supabaseClient
    .from("categories")
    .select("id, name, group_name, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {

    console.error(
      "Error cargando categorías:",
      error
    );

    categorySelect.innerHTML = `
      <option value="">
        No se pudieron cargar las categorías
      </option>
    `;

    return;
  }


  /* Limpiar selector */

  categorySelect.innerHTML = `
    <option value="">
      Selecciona una categoría
    </option>
  `;


  /* Agrupar categorías */

  const groups = {};

  categories.forEach((category) => {

    if (!groups[category.group_name]) {
      groups[category.group_name] = [];
    }

    groups[category.group_name].push(category);

  });


  /* Crear grupos y opciones */

  Object.entries(groups).forEach(
    ([groupName, groupCategories]) => {

      const optgroup =
        document.createElement("optgroup");

      optgroup.label = groupName;


      groupCategories.forEach((category) => {

        const option =
          document.createElement("option");

        option.value = category.id;
        option.textContent = category.name;

        optgroup.appendChild(option);

      });


      categorySelect.appendChild(optgroup);

    }
  );

}
initializeDashboard();
/* =========================================================
   DASHBOARD NAVIGATION
   ========================================================= */

const dashboardNavItems = document.querySelectorAll(
  ".dashboard-nav-item[data-section]"
);

const dashboardViews = document.querySelectorAll(
  ".dashboard-view"
);

function openDashboardView(section) {

  const targetView = document.querySelector(
    `.dashboard-view[data-view="${section}"]`
  );

  // Si esa vista todavía no existe, no hacemos nada.
  if (!targetView) {
    return;
  }

  // Ocultar todas las vistas
  dashboardViews.forEach((view) => {
    view.classList.remove("active");
  });

  // Quitar el estado activo de los botones
  dashboardNavItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Mostrar la vista seleccionada
  targetView.classList.add("active");

  // Activar el botón correspondiente
  const activeButton = document.querySelector(
    `.dashboard-nav-item[data-section="${section}"]`
  );

  if (activeButton) {
    activeButton.classList.add("active");
  }

  // Regresar arriba al cambiar de sección
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   EVENTOS DEL MENÚ
   ========================================================= */

dashboardNavItems.forEach((item) => {

  item.addEventListener("click", () => {

    const section = item.dataset.section;

    openDashboardView(section);

  });

});
/* =========================================================
   MISIÓN 01 · SELECCIÓN DE EVIDENCIA
   ========================================================= */

const evidenceUploadZone =
  document.getElementById("evidenceUploadZone");

const evidenceFile =
  document.getElementById("evidenceFile");

const evidenceSelectedFile =
  document.getElementById("evidenceSelectedFile");

const evidenceFileName =
  document.getElementById("evidenceFileName");

const evidenceFileSize =
  document.getElementById("evidenceFileSize");

const uploadEvidenceButton =
  document.getElementById("uploadEvidenceButton");


/* Abrir selector */

if (evidenceUploadZone && evidenceFile) {

  evidenceUploadZone.addEventListener("click", () => {
    evidenceFile.click();
  });


  /* Accesibilidad con teclado */

  evidenceUploadZone.addEventListener("keydown", (event) => {

    if (event.key === "Enter" || event.key === " ") {

      event.preventDefault();

      evidenceFile.click();

    }

  });


  /* Archivo seleccionado */

  evidenceFile.addEventListener("change", () => {

    const file = evidenceFile.files[0];

    if (!file) {
      return;
    }


    /* Límite del MVP: 50 MB */

    const maxSize =
     50 * 1024 * 1024;


    if (file.size > maxSize) {

      alert(
  "Este archivo supera el límite de 50 MB por archivo. " +
  "Puedes comprimirlo o seleccionar una versión de menor tamaño."
);

      evidenceFile.value = "";

      return;
    }


    /* Mostrar nombre */

    if (evidenceFileName) {
      evidenceFileName.textContent =
        file.name;
    }


    /* Mostrar tamaño */

    if (evidenceFileSize) {

      const sizeMB =
        file.size / (1024 * 1024);

      evidenceFileSize.textContent =
        sizeMB < 1
          ? `${Math.ceil(file.size / 1024)} KB`
          : `${sizeMB.toFixed(1)} MB`;

    }


    /* Mostrar panel */

    if (evidenceSelectedFile) {
      evidenceSelectedFile.hidden = false;
    }


    /* Activar botón */

    if (uploadEvidenceButton) {
      uploadEvidenceButton.disabled = false;
    }

  });

}
/* =========================================================
   MISIÓN 01 · SUBIR EVIDENCIA A SUPABASE
   ========================================================= */

if (uploadEvidenceButton && evidenceFile) {

  uploadEvidenceButton.addEventListener(
    "click",
    async () => {

      const file = evidenceFile.files[0];

      if (!file) {
        return;
      }

      if (!currentUser) {

        console.error(
          "No existe usuario autenticado."
        );

        return;
      }

      if (!currentProject) {

        console.error(
          "No existe un proyecto activo."
        );

        return;
      }

      /* -----------------------------------------
         Estado visual
         ----------------------------------------- */

      uploadEvidenceButton.disabled = true;

      uploadEvidenceButton.textContent =
        "REGISTRANDO EVIDENCIA...";


      try {

        /* -----------------------------------------
           Crear nombre seguro
           ----------------------------------------- */

        const safeFileName =
          file.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9._-]/g, "_");


        const storagePath =
          `${currentUser.id}/` +
          `${currentProject.id}/` +
          `mission-01/` +
          `${Date.now()}-${safeFileName}`;


        /* -----------------------------------------
           SUBIR ARCHIVO
           ----------------------------------------- */

        const {
          data: uploadData,
          error: uploadError
        } = await supabaseClient
          .storage
          .from("project-evidence")
          .upload(
            storagePath,
            file,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


        if (uploadError) {
          throw uploadError;
        }


        /* -----------------------------------------
           REGISTRAR EVIDENCIA EN BASE DE DATOS
           ----------------------------------------- */

        const {
          data: evidenceData,
          error: evidenceError
        } = await supabaseClient
          .from("project_evidence")
          .insert({
            project_id: currentProject.id,
            user_id: currentUser.id,
            mission_key: "mission-01",
            file_name: file.name,
            storage_path: uploadData.path,
            file_type:
              file.type || null,
            file_size:
              file.size
          })
          .select()
          .single();


        if (evidenceError) {
          /* -----------------------------------------
     ROLLBACK
     Si falla la base de datos,
     eliminar el archivo de Storage.
     ----------------------------------------- */

  const { error: removeError } =
    await supabaseClient
      .storage
      .from("project-evidence")
      .remove([
        uploadData.path
      ]);


  if (removeError) {

    console.error(
      "No se pudo limpiar el archivo de Storage:",
      removeError
    );

  }
          
          throw evidenceError;
        }

console.log(
  "Evidencia registrada:",
  evidenceData
);


/* -----------------------------------------
   COMPLETAR MISIÓN 01 DE FORMA SEGURA
   ----------------------------------------- */

const {
  data: missionResult,
  error: missionError
} = await supabaseClient.rpc(
  "complete_mission",
  {
    p_project_id: currentProject.id,
    p_mission_key: "mission-01"
  }
);

if (missionError) {
  throw missionError;
}

console.log(
  "Mission 01 completada:",
  missionResult
);


/* -----------------------------------------
   SINCRONIZAR XP LOCAL
   ----------------------------------------- */

if (missionResult?.total_xp !== undefined) {

  currentProject.xp =
    Number(missionResult.total_xp);

  renderXPProgress();

}


/* -----------------------------------------
   ESTADO VISUAL
   ----------------------------------------- */

uploadEvidenceButton.textContent =
  "MISIÓN COMPLETADA ✓";

uploadEvidenceButton.disabled = true;


/* -----------------------------------------
   CELEBRACIÓN
   ----------------------------------------- */

if (missionResult?.xp_awarded > 0) {

  showEvidenceRegisteredAnimation();

  if (typeof window.testXPReward === "function") {
    window.testXPReward(missionResult.xp_awarded);
  }

}
      } catch (error) {

        console.error(
          "Error registrando evidencia:",
          error
        );

        uploadEvidenceButton.disabled = false;

        uploadEvidenceButton.textContent =
          "REGISTRAR EVIDENCIA";

      }

    }
  );

}           

/* =========================================================
   MI PROYECTO · GUARDAR / ACTUALIZAR
   ========================================================= */

const projectForm =
  document.getElementById("projectForm");

const projectNameInput =
  document.getElementById("projectName");

const projectCategorySelect =
  document.getElementById("projectCategorySelect");

const projectStageSelect =
  document.getElementById("projectStage");

const projectSaveStatus =
  document.getElementById("projectSaveStatus");

const saveProjectButton =
  document.getElementById("saveProjectButton");

const projectViewCategory =
  document.getElementById("projectViewCategory");

const projectViewStage =
  document.getElementById("projectViewStage");


if (projectForm) {

  projectForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    /* -----------------------------------------
       Comprobar usuario
       ----------------------------------------- */

    if (!currentUser) {

      console.error(
        "No existe un usuario autenticado."
      );

      return;
    }


    /* -----------------------------------------
       Obtener datos
       ----------------------------------------- */

    const projectName =
      projectNameInput.value.trim();

    const categoryId =
      projectCategorySelect.value;

    const stage =
      projectStageSelect.value;


    if (!projectName || !categoryId || !stage) {
      return;
    }


    /* -----------------------------------------
       Estado: guardando
       ----------------------------------------- */

    if (saveProjectButton) {

      saveProjectButton.disabled = true;

      saveProjectButton.innerHTML =
        `GUARDANDO...`;

    }


if (projectSaveStatus) {

  projectSaveStatus.textContent =
    "GUARDANDO";

  projectSaveStatus.classList.remove(
    "saved"
  );

}

    try {

      let savedProject;


      /* =========================================
         CREAR PROYECTO
         ========================================= */

      if (!currentProject) {

        const {
          data,
          error
        } = await supabaseClient
          .from("projects")
          .insert({
            user_id: currentUser.id,
            name: projectName,
            category_id: categoryId,
            stage: stage
          })
          .select(`
            id,
            name,
            category_id,
            stage,
            xp,
            level,
            created_at
          `)
          .single();


        if (error) {
          throw error;
        }


        savedProject = data;

      }


      /* =========================================
         ACTUALIZAR PROYECTO
         ========================================= */

      else {

        const {
          data,
          error
        } = await supabaseClient
          .from("projects")
          .update({
            name: projectName,
            category_id: categoryId,
            stage: stage,
            updated_at: new Date().toISOString()
          })
          .eq(
            "id",
            currentProject.id
          )
          .select(`
            id,
            name,
            category_id,
            stage,
            xp,
            level,
            created_at
          `)
          .single();


        if (error) {
          throw error;
        }


        savedProject = data;

      }


      /* -----------------------------------------
         Guardar proyecto actual en memoria
         ----------------------------------------- */

      currentProject = savedProject;


      /* -----------------------------------------
         Actualizar resumen visual
         ----------------------------------------- */

      const selectedCategory =
        projectCategorySelect.options[
          projectCategorySelect.selectedIndex
        ];


      if (projectViewCategory) {

        projectViewCategory.textContent =
          selectedCategory
            ? selectedCategory.textContent.trim()
            : "Sin seleccionar";

      }


      if (projectViewStage) {

        projectViewStage.textContent =
          projectStageSelect.options[
            projectStageSelect.selectedIndex
          ].textContent.trim();

      }


      /* -----------------------------------------
   Éxito
   ----------------------------------------- */

if (projectSaveStatus) {

  projectSaveStatus.textContent =
    "GUARDADO ✓";

  projectSaveStatus.classList.add(
    "saved"
  );

}

showProjectSavedAnimation();

      console.log(
        "Proyecto guardado:",
        currentProject
      );

    }

    catch (error) {

      console.error(
        "Error guardando proyecto:",
        error
      );


      if (projectSaveStatus) {

        projectSaveStatus.textContent =
          "ERROR AL GUARDAR";

      }

    }

    finally {

      if (saveProjectButton) {

        saveProjectButton.disabled = false;

        saveProjectButton.innerHTML =
          `GUARDAR PROYECTO <span>→</span>`;

      }

    }

  });

}
/* =========================================================
   PROJECT SAVE · PREMIUM SUCCESS
   ========================================================= */

function showProjectSavedAnimation() {

  /* Evitar notificaciones duplicadas */

  const previousToast =
    document.querySelector(".project-save-toast");

  if (previousToast) {
    previousToast.remove();
  }


  /* Crear confirmación */

  const toast =
    document.createElement("div");

  toast.className =
    "project-save-toast";

  toast.innerHTML = `
    <div class="project-save-toast-icon">
      ✓
    </div>

    <span class="project-save-toast-label">
      JAMES LIPA / GLOBAL COMMUNITY
    </span>

    <strong>
      PROYECTO GUARDADO
    </strong>

    <p>
      Tu proyecto ya forma parte de tu espacio.
      Continúa construyendo una misión a la vez.
    </p>
  `;

  document.body.appendChild(toast);


  /* Entrada */

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

  });


  /* Mantener mensaje visible */

  setTimeout(() => {

    toast.classList.add("minimize");

    /*
      El estado pequeño se convierte
      en el punto final visual.
    */

    if (projectSaveStatus) {

      projectSaveStatus.textContent =
        "GUARDADO ✓";

      projectSaveStatus.classList.add(
        "saved"
      );

    }

  }, 2200);


  /* Limpiar elemento */

  setTimeout(() => {

    toast.remove();

  }, 2800);

}
/* =========================================================
   MISSION EVIDENCE · PREMIUM SUCCESS
   ========================================================= */

function showEvidenceRegisteredAnimation() {





  /* Evitar animaciones duplicadas */

  const previousToast =
    document.querySelector(
      ".evidence-success-toast"
    );

  if (previousToast) {
    previousToast.remove();
  }


  /* Crear confirmación */

  const toast =
    document.createElement("div");

  toast.className =
    "project-save-toast evidence-success-toast";

  toast.innerHTML = `
    <div class="project-save-toast-icon">
      ✓
    </div>

    <span class="project-save-toast-label">
      JAMES LIPA / GLOBAL COMMUNITY
    </span>

    <strong>
      EVIDENCIA REGISTRADA
    </strong>

    <span class="evidence-success-mission">
      MISIÓN 01 · HAZLO REAL
    </span>

    <p>
      Tu proyecto acaba de dejar
      su primera evidencia.
    </p>
  `;


  document.body.appendChild(toast);


  /* Entrada */

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      toast.classList.add("show");

    });

  });


  /* Minimizar */

  setTimeout(() => {

    toast.classList.add("minimize");

  }, 3400);


  /* Eliminar */

  setTimeout(() => {

    toast.remove();

  }, 4200);

}
/* =========================================================
   MISSION 02 · RESPUESTAS GUARDADAS · PREMIUM SUCCESS
   ========================================================= */

function showMission02SavedAnimation() {

  /* Evitar animaciones duplicadas */

  const previousToast =
    document.querySelector(
      ".mission02-success-toast"
    );

  if (previousToast) {
    previousToast.remove();
  }


  /* Crear tarjeta */

  const toast =
    document.createElement("div");

  toast.className =
    "project-save-toast mission02-success-toast";


  toast.innerHTML = `
    <div class="project-save-toast-icon">
      ✓
    </div>

    <span class="project-save-toast-label">
      JAMES LIPA / GLOBAL COMMUNITY
    </span>

    <strong>
      RESPUESTAS GUARDADAS
    </strong>

    <span class="evidence-success-mission">
      MISIÓN 02 · MI IDEA
    </span>

    <p>
      Tu idea ya tiene una dirección más clara.
      Sigue construyéndola una misión a la vez.
    </p>
  `;


  document.body.appendChild(toast);


  /* Entrada */

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      toast.classList.add("show");

    });

  });


  /* Minimizar */

  setTimeout(() => {

    toast.classList.add("minimize");

  }, 3400);


  /* Eliminar */

  setTimeout(() => {

    toast.remove();

  }, 4200);

}
/* =========================================================
   DEV · TEST CELEBRATION
   Eliminar antes del lanzamiento
   ========================================================= */

window.testCelebration = function () {
  console.log("🎉 TEST CELEBRATION");
  showMission02SavedAnimation();
};

/* =========================================================
   GLOBAL COMMUNITY · PRIVATE ACCESS
   ========================================================= */

const accessGate =
  document.getElementById("accessGate");

const accessPlans =
  document.querySelectorAll(".access-plan");

const accessSelection =
  document.getElementById("accessSelection");

const selectedPlanName =
  document.getElementById("selectedPlanName");

const selectedPlanPrice =
  document.getElementById("selectedPlanPrice");

const accessCheckoutButton =
  document.getElementById("accessCheckoutButton");

const verifyAccessButton =
  document.getElementById("verifyAccessButton");

const accessLogoutButton =
  document.getElementById("accessLogoutButton");

const accessStatus =
  document.getElementById("accessStatus");


/* =========================================================
   CURRENT ACCESS SELECTION
   ========================================================= */

let selectedAccessPlan = null;


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatAccessPrice(value) {

  const amount =
    Number(value || 0);

  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }
  ).format(amount);

}


/* =========================================================
   SHOW / HIDE ACCESS GATE
   ========================================================= */

function showAccessGate() {

  if (!accessGate) {
    return;
  }

  accessGate.hidden = false;

  document.body.style.overflow =
    "hidden";

}


function hideAccessGate() {

  if (!accessGate) {
    return;
  }

  accessGate.hidden = true;

  document.body.style.overflow = "";

}


/* =========================================================
   ACCESS STATUS MESSAGE
   ========================================================= */

function setAccessStatus(
  message = "",
  type = ""
) {

  if (!accessStatus) {
    return;
  }

  accessStatus.textContent =
    message;

  accessStatus.classList.remove(
    "success",
    "error"
  );

  if (type) {
    accessStatus.classList.add(type);
  }

}


/* =========================================================
   CHECK USER ACCESS
   ========================================================= */

async function checkUserAccess() {

  if (!currentUser) {

    console.error(
      "No existe usuario autenticado."
    );

    showAccessGate();

    return false;
  }


  setAccessStatus(
    "VERIFICANDO PRIVATE ACCESS..."
  );


  try {

    const {
      data: userAccess,
      error
    } = await supabaseClient
      .from("user_access")
      .select(`
        plan_key,
        plan_name,
        amount_mxn,
        payment_status,
        access_status,
        paid_at
      `)
      .eq(
        "user_id",
        currentUser.id
      )
      .maybeSingle();


    if (error) {
      throw error;
    }


    /*
      ACCESO AUTORIZADO ÚNICAMENTE CUANDO:

      payment_status = paid
      access_status  = active
    */

    const hasActiveAccess =
      userAccess &&
      userAccess.payment_status === "paid" &&
      userAccess.access_status === "active";


    if (hasActiveAccess) {

      console.log(
        "Private Access autorizado:",
        userAccess.plan_name
      );


      /* Actualizar plan visual del dashboard */

      const registrationPlan =
        document.getElementById(
          "registrationPlan"
        );

      const planStatus =
        document.getElementById(
          "planStatus"
        );


      if (registrationPlan) {

        registrationPlan.textContent =
          userAccess.plan_name ||
          userAccess.plan_key ||
          "PRIVATE ACCESS";

      }


      if (planStatus) {

        planStatus.textContent =
          "ACTIVO";

      }


      setAccessStatus(
        "PRIVATE ACCESS CONFIRMADO ✓",
        "success"
      );


      hideAccessGate();

      return true;
    }


    /*
      No existe acceso,
      pago pendiente o acceso bloqueado.
    */

    showAccessGate();

    setAccessStatus("");

    return false;

  }

  catch (error) {

    console.error(
      "Error verificando Private Access:",
      error
    );


    /*
      FAIL CLOSED:
      Si Supabase no puede confirmar el acceso,
      NO abrimos el dashboard.
    */

    showAccessGate();

    setAccessStatus(
      "NO PUDIMOS VERIFICAR TU ACCESO. INTENTA DE NUEVO.",
      "error"
    );

    return false;

  }

}


/* =========================================================
   PLAN SELECTION
   ========================================================= */

accessPlans.forEach((planCard) => {

  planCard.addEventListener(
    "click",
    () => {

      accessPlans.forEach(
        (card) => {
          card.classList.remove(
            "selected"
          );
        }
      );


      planCard.classList.add(
        "selected"
      );


      selectedAccessPlan = {
        key:
          planCard.dataset.plan,

        name:
          planCard.dataset.planName,

        price:
          Number(
            planCard.dataset.price
          )
      };


      if (selectedPlanName) {

        selectedPlanName.textContent =
          selectedAccessPlan.name;

      }


      if (selectedPlanPrice) {

        selectedPlanPrice.textContent =
          formatAccessPrice(
            selectedAccessPlan.price
          );

      }


      if (accessSelection) {

        accessSelection.hidden =
          false;

      }


      setAccessStatus("");

    }
  );

});


/* =========================================================
   CHECKOUT
   ========================================================= */

if (accessCheckoutButton) {

  accessCheckoutButton.addEventListener(
    "click",
    async () => {

      if (!selectedAccessPlan) {

        setAccessStatus(
          "SELECCIONA UN PLAN PARA CONTINUAR.",
          "error"
        );

        return;
      }


      /*
        IMPORTANTE:

        El navegador NO activa el acceso.

        Tampoco escribimos:
        payment_status = paid
        access_status  = active

        La activación será realizada
        posteriormente por nuestro backend
        después de confirmar el pago.
      */


      console.log(
        "Plan seleccionado para checkout:",
        selectedAccessPlan.key
      );


      setAccessStatus(
        "PREPARANDO PAGO SEGURO..."
      );


      /*
        PRÓXIMA ETAPA:
        conectar este botón con
        nuestro endpoint seguro de checkout.
      */

      setTimeout(() => {

        setAccessStatus(
          "EL SISTEMA DE PAGO SE CONECTARÁ EN LA SIGUIENTE ETAPA."
        );

      }, 700);

    }
  );

}


/* =========================================================
   VERIFY EXISTING ACCESS
   ========================================================= */

if (verifyAccessButton) {

  verifyAccessButton.addEventListener(
    "click",
    async () => {

      verifyAccessButton.disabled =
        true;


      setAccessStatus(
        "VERIFICANDO TU ACCESO..."
      );


      await checkUserAccess();


      verifyAccessButton.disabled =
        false;

    }
  );

}


/* =========================================================
   LOGOUT FROM ACCESS GATE
   ========================================================= */

if (accessLogoutButton) {

  accessLogoutButton.addEventListener(
    "click",
    async () => {

      accessLogoutButton.disabled =
        true;


      try {

        const { error } =
          await supabaseClient
            .auth
            .signOut();


        if (error) {
          throw error;
        }


        window.location.replace(
          "login.html"
        );

      }

      catch (error) {

        console.error(
          "Error cerrando sesión:",
          error
        );


        accessLogoutButton.disabled =
          false;


        setAccessStatus(
          "NO SE PUDO CERRAR LA SESIÓN.",
          "error"
        );

      }

    }
  );

}
/* =========================================================
   MISIÓN 02 · ABRIR MISIÓN
   ========================================================= */
   /* =========================================================
   MISIÓN 02 · NAVEGACIÓN
   ========================================================= */

const startMission02 =
  document.getElementById("startMission02");

const continueMission =
  document.getElementById("continueMission");

const mission02Panel =
  document.getElementById("mission02Panel");


function openMission02() {

  /* Mostrar primero el formulario */

  if (mission02Panel) {
    mission02Panel.hidden = false;
    mission02Panel.style.display = "";
  }

/* Si ya estaba completada, entramos en modo edición */

if (mission02Completed && completeMission02) {

  completeMission02.disabled = false;

  completeMission02.innerHTML =
    `ACTUALIZAR RESPUESTAS <span>→</span>`;
}

  /* Abrir vista Misiones */

  openDashboardView("missions");


  /* Esperar a que la vista esté visible */

  setTimeout(() => {

    if (mission02Panel) {

      mission02Panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }, 500);

}

/* Botón dentro de Misiones */

if (startMission02) {
  startMission02.addEventListener("click", () => {
    if (mission04Completed) {
      openMission05().catch(console.error);
    } else if (mission03Completed) {
      openMission04();
    } else if (mission02Completed) {
      openMission03();
    } else {
      openMission02();
    }
  });
}

/* Botón CONTINUAR de Inicio */

if (continueMission) {

  continueMission.addEventListener(
    "click",
    () => {

      if (mission04Completed) {
        openMission05().catch((error) => {
          console.error("M05 navigation:", error);
          const feedback = document.getElementById("mission05Feedback");
          if (feedback) feedback.textContent = "No se pudo abrir M05. Revisa la consola.";
        });
        return;
      }
      openDashboardView("missions");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}

/* =========================================================
   MISIÓN 02 · GUARDAR RESPUESTAS
   ========================================================= */

const mission02Form =
  document.getElementById("mission02Form");

const mission02What =
  document.getElementById("mission02What");

const mission02Who =
  document.getElementById("mission02Who");

const mission02Problem =
  document.getElementById("mission02Problem");

const completeMission02 =
  document.getElementById("completeMission02");


if (mission02Form) {

  mission02Form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      /* -----------------------------------------
         COMPROBAR USUARIO Y PROYECTO
         ----------------------------------------- */

      if (!currentUser || !currentProject) {

        console.error(
          "No existe usuario o proyecto activo."
        );

        return;
      }


      /* -----------------------------------------
         OBTENER RESPUESTAS
         ----------------------------------------- */

      const what =
        mission02What.value.trim();

      const who =
        mission02Who.value.trim();

      const problem =
        mission02Problem.value.trim();


      if (!what || !who || !problem) {
        return;
      }


      /* -----------------------------------------
         ESTADO VISUAL
         ----------------------------------------- */

      if (completeMission02) {

        completeMission02.disabled = true;

        completeMission02.innerHTML =
          `GUARDANDO...`;
      }


      try {

        /* -----------------------------------------
           GUARDAR / ACTUALIZAR RESPUESTAS
           ----------------------------------------- */

        const {
          data,
          error
        } = await supabaseClient
          .from("mission_responses")
          .upsert(
            {
              project_id: currentProject.id,

              user_id: currentUser.id,

              mission_key: "mission-02",

              answers: {
                what: what,
                who: who,
                problem: problem
              },

              updated_at:
                new Date().toISOString()
            },
            {
              onConflict:
                "project_id,mission_key"
            }
          )
          .select()
          .single();


        if (error) {
          throw error;
        }


        console.log(
          "Mission 02 guardada:",
          data
        );

        /* -----------------------------------------
   COMPLETAR MISIÓN 02 + OTORGAR XP
   ----------------------------------------- */


if (!mission02Completed) {

  const {
    data: missionResult,
    error: missionError
  } = await supabaseClient.rpc(
    "complete_mission",
    {
      p_project_id: currentProject.id,
      p_mission_key: "mission-02"
    }
  );

  if (missionError) {
    throw missionError;
  }

  console.log(
    "Mission 02 completada:",
    missionResult
  );

  /* La misión ya queda completada en esta sesión */
  mission02Completed = true;


  /* Sincronizar XP inmediatamente */

  if (missionResult?.total_xp !== undefined) {

    currentProject.xp =
      Number(missionResult.total_xp);

    renderXPProgress();

    if (Number(missionResult?.xp_awarded) > 0) {
  if (typeof window.testXPReward === "function") {
    window.testXPReward(Number(missionResult.xp_awarded));
  }
}
  }

}
else {

  console.log(
    "Mission 02 actualizada sin otorgar XP adicional."
  );

}


        /* -----------------------------------------
           CONFIRMACIÓN VISUAL
           ----------------------------------------- */

        if (completeMission02) {

          completeMission02.innerHTML =
            `RESPUESTAS GUARDADAS ✓`;

        }
        
      showMission02SavedAnimation();
      /* -----------------------------------------
   CERRAR FORMULARIO DESPUÉS DE GUARDAR
   ----------------------------------------- */

setTimeout(() => {

  if (mission02Panel) {

    mission02Panel.hidden = true;
    mission02Panel.style.display = "none";

  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}, 1200);

      }

      catch (error) {

        console.error(
          "Error guardando Mission 02:",
          error
        );


        if (completeMission02) {

          completeMission02.innerHTML =
            `INTENTAR DE NUEVO <span>→</span>`;

          completeMission02.disabled = false;

        }

      }

    }
  );

}
/* =========================================================
   MISIÓN 03 · DALE IDENTIDAD
   ========================================================= */

let mission03Completed = false;

const mission03Panel =
  document.getElementById("mission03Panel");

const mission03Form =
  document.getElementById("mission03Form");

const mission03Button =
  document.getElementById("completeMission03");

const mission03Feedback =
  document.getElementById("mission03Feedback");

/* =========================================================
   MISIÓN 03 · VER / EDITAR RESPUESTAS
   ========================================================= */

function showMission03EditButton() {

  if (!mission03Completed || !mission03Panel) return;

  if (document.getElementById("editMission03")) return;

  const button = document.createElement("button");

  button.id = "editMission03";
  button.type = "button";
  button.textContent = "VER / EDITAR RESPUESTAS · MISIÓN 03";

  button.className = "mission-edit-button";

  button.addEventListener("click", openMission03);

  mission03Panel.parentElement.insertBefore(
    button,
    mission03Panel
  );
}

function openMission03() {
  if (!mission03Panel) return;

  openDashboardView("missions");

  mission03Panel.hidden = false;
  mission03Panel.style.display = "";

  if (mission03Button) {
    mission03Button.textContent = mission03Completed
      ? "ACTUALIZAR RESPUESTAS →"
      : "COMPLETAR MISIÓN →";
  }

  mission03Panel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


async function loadMission03() {
  if (!currentUser || !currentProject) return;

  const [responses, status] = await Promise.all([
    supabaseClient
      .from("mission_responses")
      .select("answers")
      .eq("user_id", currentUser.id)
      .eq("project_id", currentProject.id)
      .eq("mission_key", "mission-03")
      .maybeSingle(),

    supabaseClient
      .from("user_missions")
      .select("status,missions!inner(mission_key)")
      .eq("user_id", currentUser.id)
      .eq("project_id", currentProject.id)
      .eq("missions.mission_key", "mission-03")
      .maybeSingle()
  ]);

  if (responses.error || status.error) {
    console.error(
      "Error cargando Misión 03:",
      responses.error,
      status.error
    );
    return;
  }

  const answers = responses.data?.answers || {};

  const fields = {
    mission03Value: answers.value,
    mission03Personality: answers.personality,
    mission03Memory: answers.memory
  };

  for (const [id, value] of Object.entries(fields)) {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  }

  mission03Completed =
    status.data?.status === "completed";

    if (mission03LogoInput) {
  mission03LogoInput.disabled = !mission03Completed;
}

await loadMission03Logo();

  if (mission03Completed) {

showMission03EditButton();
    renderMission04ComingSoon();

    const label =
      document.getElementById("mission03Status");

    if (label) {
      label.textContent = "COMPLETADA ✓";
      label.classList.add("saved");
    }

    for (const id of [
      "homeMission03Step",
      "missionsMission03Step"
    ]) {
      const step = document.getElementById(id);

      if (step) {
        step.classList.remove("current", "locked");
        step.classList.add("completed");
      }
    }

    for (const id of [
      "homeMission03Node",
      "missionsMission03Node"
    ]) {
      const node = document.getElementById(id);
      if (node) node.textContent = "✓";
    }

    for (const id of [
      "homeMissionCounter",
      "missionsMissionCounter"
    ]) {
      const counter = document.getElementById(id);
      if (counter) counter.textContent = "3 / 3";
    }
  }
}


/* M04 · Restore saved state and completion from server, never from XP alone. */
let mission04Completed = false;
let mission04SavedAnswers = null;
async function loadMission04Status() {
  if (!currentUser || !currentProject) return;
  const [responses, status] = await Promise.all([
    supabaseClient.from("mission_responses").select("answers")
      .eq("user_id", currentUser.id).eq("project_id", currentProject.id)
      .eq("mission_key", "mission-04").maybeSingle(),
    supabaseClient.from("user_missions").select("status,missions!inner(mission_key)")
      .eq("user_id", currentUser.id).eq("project_id", currentProject.id)
      .eq("missions.mission_key", "mission-04").maybeSingle()
  ]);
  if (responses.error || status.error) {
    console.error("M04 status could not be restored", responses.error, status.error);
    return;
  }
  mission04SavedAnswers = responses.data?.answers || null;
  mission04Completed = status.data?.status === "completed";
  if (mission04SavedAnswers) {
    mission04SelectedChallenge = mission04SavedAnswers.challenge || null;
    mission04SelectedAudience = mission04SavedAnswers.audience || null;
    mission04SelectedAdvantage = mission04SavedAnswers.advantage || null;
  }
  if (mission04Completed) {
    const labels = {
      homeNextMissionNumber: "05", homeNextMissionTitle: "Idea Validation",
      homeNextMissionDescription: "Pon tu idea a prueba con una acción real.",
      missionsCurrentMissionNumber: "05", missionsCurrentMissionTitle: "Idea Validation",
      missionsCurrentMissionDescription: "Valida tu proyecto con un experimento real adaptado a tu categoría."
    };
    Object.entries(labels).forEach(([id,value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    const start = document.getElementById("startMission02");
    if (start) { start.textContent = "INICIAR MISIÓN 05 →"; start.disabled = false; }
    const launch = document.getElementById("openMission05Preview");
    if (launch) launch.hidden = false;
    const continueButton = document.getElementById("continueMission");
    if (continueButton) continueButton.setAttribute("aria-label", "Abrir M05 Idea Validation");
    const panel = document.getElementById("mission04Panel");
    if (panel) panel.hidden = true;
    const result = document.getElementById("mission04Result");
    if (result) {
      result.replaceChildren();
      const title = document.createElement("h3"); title.textContent = "MISIÓN 04 · COMPLETADA ✓";
      const copy = document.createElement("p");
      copy.textContent = mission04SavedAnswers?.value_proposition || "Propuesta guardada correctamente.";
      result.append(title,copy); result.hidden = false;
    }
    if (panel && !document.getElementById("viewMission04Completed")) {
      const view = document.createElement("button");
      view.type = "button"; view.id = "viewMission04Completed";
      view.className = "mission-edit-button";
      view.textContent = "VER MISIÓN 04 COMPLETADA ✓";
      view.addEventListener("click", () => {
        openDashboardView("missions");
        panel.hidden = !panel.hidden;
        const cards = document.getElementById("mission04Cards");
        if (cards) cards.hidden = true;
        if (result) result.hidden = false;
      });
      panel.parentElement.insertBefore(view,panel);
    }
  }
}

/* ==========================================
   MISIÓN 04 · LABORATORIO DE VALOR
   Opciones para las tarjetas interactivas
   ========================================== */

const mission04Options = {
  challenge: [
    { id: "time", label: "Ahorrar tiempo", icon: "⏱️" },
    { id: "cost", label: "Reducir costos", icon: "💰" },
    { id: "experience", label: "Mejorar experiencias", icon: "✨" },
    { id: "access", label: "Facilitar el acceso", icon: "🌍" },
    { id: "creativity", label: "Impulsar creatividad", icon: "💡" },
    { id: "wellbeing", label: "Mejorar el bienestar", icon: "🌱" }
  ],

  audience: [
    { id: "people", label: "Personas", icon: "👤" },
    { id: "entrepreneurs", label: "Emprendedores", icon: "🚀" },
    { id: "companies", label: "Empresas", icon: "🏢" },
    { id: "communities", label: "Comunidades", icon: "🤝" },
    { id: "creators", label: "Creadores", icon: "🎨" },
    { id: "travelers", label: "Viajeros", icon: "✈️" }
  ],

  advantage: [
    { id: "innovation", label: "Innovación", icon: "⚡" },
    { id: "quality", label: "Calidad", icon: "💎" },
    { id: "speed", label: "Rapidez", icon: "🚀" },
    { id: "personalization", label: "Personalización", icon: "🎯" },
    { id: "accessibility", label: "Accesibilidad", icon: "🌐" },
    { id: "premium", label: "Experiencia premium", icon: "👑" }
  ]
};


/* ==========================================
   MISIÓN 04 · TARJETAS INTERACTIVAS
   ETAPA 01 — DESAFÍO
   ========================================== */

let mission04SelectedChallenge = null;


/* MISIÓN 04 · ESTADO DE LAS TRES ETAPAS */

let mission04SelectedAudience = null;
let mission04SelectedAdvantage = null;

let mission04CurrentStage = "challenge";


function renderMission04ChallengeCards() {
  const container = document.getElementById("mission04Cards");
  if (!container) return;

  container.replaceChildren();

  mission04Options.challenge.forEach((option) => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "mission04-card";

    const isSelected =
      mission04SelectedChallenge === option.id;

    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));

    const icon = document.createElement("span");
    icon.textContent = option.icon;
    icon.style.display = "block";
    icon.style.fontSize = "28px";
    icon.style.marginBottom = "16px";

    const label = document.createElement("strong");
    label.textContent = option.label;
    label.style.display = "block";
    label.style.fontSize = "13px";

    card.append(icon, label);

    card.addEventListener("click", () => {
      mission04SelectedChallenge = option.id;
      renderMission04ChallengeCards();

      const feedback =
        document.getElementById("mission04Feedback");

      if (feedback) {
        feedback.textContent =
          `Desafío seleccionado: ${option.label}`;

      }
    });

    container.appendChild(card);
  });
  
/* MISIÓN 04 · BOTÓN CONTINUAR */

const continueButton = document.createElement("button");

continueButton.type = "button";
continueButton.className = "mission04-continue";
continueButton.textContent = "CONTINUAR →";

continueButton.disabled = !mission04SelectedChallenge;

continueButton.addEventListener("click", () => {
  if (!mission04SelectedChallenge) return;

  mission04CurrentStage = "audience";

  renderMission04AudienceCards();

  const feedback =
    document.getElementById("mission04Feedback");

  if (feedback) {
    feedback.textContent =
      "Etapa 01 completada. Preparando Audiencia.";
  }
});

container.appendChild(continueButton);

}


/* ==========================================
   MISIÓN 04 · ETAPA 02 — AUDIENCIA
   ========================================== */

function renderMission04AudienceCards() {
  const container = document.getElementById("mission04Cards");
  if (!container) return;

  mission04CurrentStage = "audience";
  container.replaceChildren();

  mission04Options.audience.forEach((option) => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "mission04-card";

    const isSelected =
      mission04SelectedAudience === option.id;

    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));

    const icon = document.createElement("span");
    icon.className = "mission04-card-icon";
    icon.textContent = option.icon;

    const label = document.createElement("strong");
    label.className = "mission04-card-label";
    label.textContent = option.label;

    card.append(icon, label);

    card.addEventListener("click", () => {
      mission04SelectedAudience = option.id;
      renderMission04AudienceCards();

      const feedback =
        document.getElementById("mission04Feedback");

      if (feedback) {
        feedback.textContent =
          `Audiencia seleccionada: ${option.label}`;
      }
    });

    container.appendChild(card);
  });

  const continueButton = document.createElement("button");

  continueButton.type = "button";
  continueButton.className = "mission04-continue";
  continueButton.textContent = "CONTINUAR →";
  continueButton.disabled = !mission04SelectedAudience;

  continueButton.addEventListener("click", () => {
    if (!mission04SelectedAudience) return;

    mission04CurrentStage = "advantage";

renderMission04AdvantageCards();

    const feedback =
      document.getElementById("mission04Feedback");

    if (feedback) {
      feedback.textContent =
        "Etapa 02 completada. Preparando Diferencial.";
    }
  });

  container.appendChild(continueButton);
}


/* ==========================================
   MISIÓN 04 · ETAPA 03 — DIFERENCIAL
   ========================================== */

function renderMission04AdvantageCards() {
  const container = document.getElementById("mission04Cards");
  if (!container) return;

  mission04CurrentStage = "advantage";
  container.replaceChildren();

  mission04Options.advantage.forEach((option) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "mission04-card";

    const isSelected =
      mission04SelectedAdvantage === option.id;

    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));

    const icon = document.createElement("span");
    icon.className = "mission04-card-icon";
    icon.textContent = option.icon;

    const label = document.createElement("strong");
    label.className = "mission04-card-label";
    label.textContent = option.label;

    card.append(icon, label);

    card.addEventListener("click", () => {
      mission04SelectedAdvantage = option.id;
      renderMission04AdvantageCards();

      const feedback =
        document.getElementById("mission04Feedback");

      if (feedback) {
        feedback.textContent =
          `Diferencial seleccionado: ${option.label}`;
      }
    });

    container.appendChild(card);
  });

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "mission04-continue";
  continueButton.textContent = "CREAR MI PROPUESTA →";
  continueButton.disabled = !mission04SelectedAdvantage;

  continueButton.addEventListener("click", () => {
    if (!mission04SelectedAdvantage) return;

    renderMission04ValueProposition();

    const feedback =
      document.getElementById("mission04Feedback");

    if (feedback) {
      feedback.textContent =
        "Diferencial registrado. Preparando tu propuesta de valor.";
    }
  });

  container.appendChild(continueButton);
}


/* ==========================================
   MISIÓN 04 · GUARDAR PROPUESTA
   ========================================== */

async function saveMission04ValueProposition(proposition) {
  if (!currentUser || !currentProject) {
    throw new Error("No existe usuario o proyecto activo.");
  }

  const { data, error } = await supabaseClient
    .from("mission_responses")
    .upsert(
      {
        project_id: currentProject.id,
        user_id: currentUser.id,
        mission_key: "mission-04",
        answers: {
          challenge: mission04SelectedChallenge,
          audience: mission04SelectedAudience,
          advantage: mission04SelectedAdvantage,
          value_proposition: proposition
        },
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "project_id,mission_key"
      }
    )
    .select("id, answers, updated_at")
    .single();

  if (error) throw error;

  return data;
}

/* ==========================================
   MISIÓN 04 · PROPUESTA DE VALOR
   ========================================== */

function renderMission04ValueProposition() {
  const result = document.getElementById("mission04Result");
  const feedback = document.getElementById("mission04Feedback");

  if (!result) return;

  const challenge = mission04Options.challenge.find(
    option => option.id === mission04SelectedChallenge
  );

  const audience = mission04Options.audience.find(
    option => option.id === mission04SelectedAudience
  );

  const advantage = mission04Options.advantage.find(
    option => option.id === mission04SelectedAdvantage
  );

  if (!challenge || !audience || !advantage) {
    if (feedback) {
      feedback.textContent =
        "Completa las tres etapas para generar tu propuesta.";
    }
    return;
  }

  const projectName =
    currentProject?.name?.trim() || "Mi proyecto";

  const proposition =
    `${projectName} ayuda a ${audience.label.toLowerCase()} ` +
    `a ${challenge.label.toLowerCase()}, ` +
    `a través de ${advantage.label.toLowerCase()}.`;

  result.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "TU PROPUESTA DE VALOR";

  const description = document.createElement("p");
  description.textContent = proposition;

  
result.append(heading, description);
result.hidden = false;

if (feedback) {
  feedback.textContent = "GUARDANDO PROPUESTA...";
}


saveMission04ValueProposition(proposition)
  .then(async () => {
    if (feedback) {
      feedback.textContent = "VALIDANDO MISIÓN 04...";
    }

    const { data: missionResult, error: missionError } =
      await supabaseClient.rpc("complete_mission", {
        p_project_id: currentProject.id,
        p_mission_key: "mission-04"
      });

    if (missionError) {
      throw missionError;
    }

    if (missionResult?.total_xp !== undefined) {
      currentProject.xp = Number(missionResult.total_xp);
      renderXPProgress();
    }

    if (feedback) {
      feedback.textContent =
        "MISIÓN 04 COMPLETADA CORRECTAMENTE ✓";
    }

    if (
      missionResult?.xp_awarded > 0 &&
      typeof window.testXPReward === "function"
    ) {
      window.testXPReward(missionResult.xp_awarded);
    }

    await loadMission04Status();
    console.log("Misión 04 completada:", missionResult);
  })
  .catch((error) => {
    console.error("Error completando Misión 04:", error);

    if (feedback) {
      feedback.textContent =
        "NO SE PUDO COMPLETAR LA MISIÓN. INTENTA DE NUEVO.";
    }
  });

}

/* ==========================================
   MISIÓN 04 · ABRIR LABORATORIO DE VALOR
   ========================================== */


function openMission04() {
  if (mission04Completed) {
    document.getElementById("viewMission04Completed")?.click();
    return;
  }
  const panel = document.getElementById("mission04Panel");

  if (!panel) {
    console.warn("No se encontró mission04Panel.");
    return;
  }

  openDashboardView("missions");

  panel.hidden = false;

  renderMission04ChallengeCards();

  const feedback =
    document.getElementById("mission04Feedback");

  if (feedback) {
    feedback.textContent =
      "ETAPA 01 · Selecciona el desafío de tu proyecto.";
  }

  panel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================================
   MISIÓN 03 COMPLETADA · TRANSICIÓN A MISIÓN 04
   ========================================================= */

function renderMission04ComingSoon() {

  const labels = {
  homeNextMissionNumber: "04",
  homeNextMissionTitle: "Laboratorio de Valor",
  homeNextMissionDescription:
    "Descubre el desafío, la audiencia y el diferencial que hacen único a tu proyecto.",

  missionsCurrentMissionNumber: "04",
  missionsCurrentMissionTitle: "Laboratorio de Valor",
  missionsCurrentMissionDescription:
    "Construye tu propuesta de valor mediante tarjetas interactivas."
};

  for (const [id, text] of Object.entries(labels)) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = text;
    }
  }

 
// Habilitar Laboratorio de Valor.
if (startMission02) {
  startMission02.disabled = false;
  startMission02.textContent = "INICIAR MISIÓN 04 →";
}

  // Ocultar el formulario sin borrar las respuestas.
  if (mission03Panel) {
    mission03Panel.hidden = true;
    mission03Panel.style.display = "none";
  }

}

/* =========================================================
   MISIÓN 03 · ANIMACIÓN DE CELEBRACIÓN
   ========================================================= */

function showMission03CompletedAnimation(xp = 40) {

  document.querySelector(".mission03-success-toast")?.remove();

  const toast = document.createElement("div");

  toast.className =
    "project-save-toast mission03-success-toast";

  toast.innerHTML = `
    <div class="project-save-toast-icon">✓</div>

    <span class="project-save-toast-label">
      JAMES LIPA / GLOBAL COMMUNITY
    </span>

    <strong>MISIÓN 03 COMPLETADA</strong>

    <span class="evidence-success-mission">
      DALE IDENTIDAD
    </span>

    <p>
      +${xp} XP · Tu proyecto ya tiene identidad.
    </p>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  });

  setTimeout(() => {
    toast.classList.add("minimize");
  }, 3400);

  setTimeout(() => {
    toast.remove();
  }, 4200);
}

/* Prueba visual sin otorgar XP */
window.testMission03Celebration = () => {
  showMission03CompletedAnimation(40);
};

if (mission03Form) {
  mission03Form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser || !currentProject || !mission02Completed) {
      mission03Feedback.textContent =
        "Primero completa la Misión 02.";
      return;
    }

    const value =
      document.getElementById("mission03Value").value.trim();

    const personality =
      document.getElementById("mission03Personality").value.trim();

    const memory =
      document.getElementById("mission03Memory").value.trim();

    const words = personality
      .split(",")
      .map(word => word.trim())
      .filter(Boolean);

    if (
      !value ||
      !memory ||
      words.length !== 3 ||
      words.some(word => word.split(/\s+/).length !== 1)
    ) {
      mission03Feedback.textContent =
        "Completa las respuestas y escribe tres palabras separadas por comas.";
      return;
    }

    mission03Button.disabled = true;
    mission03Button.textContent = "GUARDANDO...";
    mission03Feedback.textContent = "";

    try {
      const { error } = await supabaseClient
        .from("mission_responses")
        .upsert({
          project_id: currentProject.id,
          user_id: currentUser.id,
          mission_key: "mission-03",
          answers: {
            value,
            personality: words.join(", "),
            memory
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: "project_id,mission_key"
        });

      if (error) throw error;

   if (!mission03Completed) {

  const result = await supabaseClient.rpc(
    "complete_mission",
    {
      p_project_id: currentProject.id,
      p_mission_key: "mission-03"
    }
  );

  if (result.error) throw result.error;

  mission03Completed = true;

  const xpAwarded =
    Number(result.data?.xp_awarded || 0);

  if (xpAwarded > 0) {

  showMission03CompletedAnimation(xpAwarded);

  if (typeof window.testXPReward === "function") {
    window.testXPReward(xpAwarded);
  }

}
}

      mission03Feedback.textContent =
        "Identidad guardada correctamente ✓";

      await loadCurrentProject();
      await loadMission03();

      mission03Button.textContent =
        "ACTUALIZAR RESPUESTAS →";

      setTimeout(() => {
        mission03Panel.hidden = true;
        mission03Panel.style.display = "none";
      }, 1200);

    } catch (error) {
      console.error("Error en Misión 03:", error);

      mission03Feedback.textContent =
        "No se pudo completar el guardado.";

      mission03Button.textContent = "REINTENTAR →";

    } finally {
      mission03Button.disabled = false;
    }
  });
}
/* =========================================================
   MISIÓN 03 · BONUS CREATIVO · LOGO
   ========================================================= */

const mission03LogoInput =
  document.getElementById("mission03Logo");

const saveMission03LogoButton =
  document.getElementById("saveMission03Logo");

const mission03LogoFeedback =
  document.getElementById("mission03LogoFeedback");

const mission03SavedLogo =
  document.getElementById("mission03SavedLogo");

const MISSION03_LOGO_MAX_SIZE = 10 * 1024 * 1024;

const MISSION03_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf"
];

if (mission03LogoInput && saveMission03LogoButton) {

  mission03LogoInput.disabled = true;

  mission03LogoInput.addEventListener("change", () => {

    saveMission03LogoButton.disabled = true;

    const file = mission03LogoInput.files?.[0];

    if (!file) return;

    if (
      !MISSION03_LOGO_TYPES.includes(file.type) ||
      file.size > MISSION03_LOGO_MAX_SIZE ||
      file.size === 0
    ) {
      mission03LogoFeedback.textContent =
        "Selecciona un PNG, JPG, WEBP o PDF válido de máximo 10 MB.";

      mission03LogoInput.value = "";
      return;
    }

    mission03LogoFeedback.textContent =
      `Archivo seleccionado: ${file.name}`;

    saveMission03LogoButton.disabled = !mission03Completed;

  });
}

/* =========================================================
   MISIÓN 03 · GUARDAR LOGO EN SUPABASE
   ========================================================= */

if (saveMission03LogoButton && mission03LogoInput) {

  saveMission03LogoButton.addEventListener("click", async () => {

    const file = mission03LogoInput.files?.[0];

    if (
      !file ||
      !currentUser ||
      !currentProject ||
      !mission03Completed
    ) {
      mission03LogoFeedback.textContent =
        "Completa la Misión 03 antes de guardar el logo.";
      return;
    }

    if (
      !MISSION03_LOGO_TYPES.includes(file.type) ||
      file.size === 0 ||
      file.size > MISSION03_LOGO_MAX_SIZE
    ) {
      mission03LogoFeedback.textContent =
        "Archivo inválido. Máximo 10 MB.";
      return;
    }

    saveMission03LogoButton.disabled = true;
    saveMission03LogoButton.textContent = "GUARDANDO...";

    let uploadedPath = null;
    let evidenceSaved = false;

    try {

      const extension = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "application/pdf": "pdf"
      }[file.type];

      const storagePath =
        `${currentUser.id}/${currentProject.id}/` +
        `mission-03/logo/${crypto.randomUUID()}.${extension}`;

      const { data: uploaded, error: uploadError } =
        await supabaseClient.storage
          .from("project-evidence")
          .upload(storagePath, file, {
            upsert: false,
            contentType: file.type
          });

      if (uploadError) throw uploadError;

      uploadedPath = uploaded.path;

      const { error: evidenceError } =
        await supabaseClient
          .from("project_evidence")
          .insert({
            user_id: currentUser.id,
            project_id: currentProject.id,
            mission_key: "mission-03",
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: uploadedPath
          });

      if (evidenceError) throw evidenceError;

      evidenceSaved = true;
      /* MISIÓN 03 · RECLAMAR BONUS CREATIVO */

const { data: bonusResult, error: bonusError } =
  await supabaseClient.rpc(
    "claim_mission03_logo_bonus",
    {
      p_project_id: currentProject.id
    }
  );

if (bonusError) {
  console.error(
    "Error acreditando bonus M03:",
    bonusError
  );

  mission03LogoFeedback.textContent =
    "Logo guardado. Bonus XP pendiente de acreditar.";

} else {

  if (bonusResult?.total_xp !== undefined) {
    currentProject.xp = Number(bonusResult.total_xp);
    renderXPProgress();
  }
if (bonusResult?.xp_awarded === 15) {
  mission03LogoFeedback.textContent =
    "¡LOGO GUARDADO! BONUS +15 XP ✓";

  if (typeof window.testXPReward === "function") {
    window.testXPReward(15);
  }
}
  else {
    mission03LogoFeedback.textContent =
      "LOGO GUARDADO ✓ BONUS YA ACREDITADO";
  }

}


      mission03LogoInput.value = "";

      await loadMission03Logo();

    } catch (error) {

      console.error("Error guardando logo:", error);

      if (uploadedPath && !evidenceSaved) {
        const { error: cleanupError } =
          await supabaseClient.storage
            .from("project-evidence")
            .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Error limpiando archivo:", cleanupError);
        }
      }

      mission03LogoFeedback.textContent =
        evidenceSaved
          ? "Logo guardado, pero no pudo actualizarse la vista."
          : "No se pudo guardar el logo.";

    } finally {

      saveMission03LogoButton.textContent = "GUARDAR LOGO";
      saveMission03LogoButton.disabled = true;

    }
  });
}

/* =========================================================
   MISIÓN 03 · RECUPERAR LOGO GUARDADO
   ========================================================= */

async function loadMission03Logo() {

  if (!currentUser || !currentProject || !mission03SavedLogo) {
    return;
  }

  const { data: logo, error } = await supabaseClient
    .from("project_evidence")
    .select("file_name,storage_path,created_at")
    .eq("user_id", currentUser.id)
    .eq("project_id", currentProject.id)
    .eq("mission_key", "mission-03")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error recuperando logo:", error);
    return;
  }

  mission03SavedLogo.replaceChildren();

  if (!logo) {
    mission03SavedLogo.hidden = true;
    return;
  }
  /* MISIÓN 03 · RECLAMAR BONUS DE LOGO EXISTENTE */

const { data: bonusResult, error: bonusError } =
  await supabaseClient.rpc(
    "claim_mission03_logo_bonus",
    {
      p_project_id: currentProject.id
    }
  );

if (bonusError) {
  console.error("Error bonus M03:", bonusError);

  if (mission03LogoFeedback) {
    mission03LogoFeedback.textContent =
      "Logo registrado. Bonus XP pendiente.";
  }
} else {
  if (bonusResult?.total_xp !== undefined) {
    currentProject.xp = Number(bonusResult.total_xp);
    renderXPProgress();
  }

  if (mission03LogoFeedback) {
    mission03LogoFeedback.textContent =
      bonusResult?.xp_awarded === 15
        ? "¡BONUS CREATIVO +15 XP ACREDITADOS! ✓"
        : "LOGO GUARDADO ✓ BONUS YA ACREDITADO";
  }
}

  const fileName = document.createElement("p");
  fileName.textContent = `ARCHIVO GUARDADO ✓ ${logo.file_name}`;

  const viewButton = document.createElement("button");

  viewButton.type = "button";
  viewButton.className = "mission-edit-button";
  viewButton.textContent = "VER ARCHIVO ↗";

  viewButton.addEventListener("click", async () => {

    const { data, error: urlError } =
      await supabaseClient.storage
        .from("project-evidence")
        .createSignedUrl(logo.storage_path, 60);

    if (urlError || !data?.signedUrl) {
      mission03LogoFeedback.textContent =
        "No se pudo abrir el archivo.";
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener");

  });

  mission03SavedLogo.append(fileName, viewButton);
  mission03SavedLogo.hidden = false;
}

/* =========================================================
   M05 · CATEGORY EXPLORER — PREVIEW ONLY
   Reutiliza la sesión y categorías activas de M04/dashboard.
   No concede XP ni escribe en Supabase.
   ========================================================= */
const mission05Catalog = [
  ["negocios","◈","Presenta tu oferta a 2 personas y pregunta si pagarían por ella."],
  ["tecnología","✧","Muestra un prototipo o flujo de IA a 2 usuarios y observa dónde se detienen."],
  ["software","⌘","Pide a 2 usuarios completar una tarea con tu prototipo sin darles instrucciones."],
  ["inversiones","↗","Compara 2 alternativas y consulta qué riesgo preocupa más a tu audiencia."],
  ["emprendimiento","✦","Explica tu solución a 2 clientes potenciales y registra sus objeciones."],
  ["contenido","▣","Publica 2 versiones de un mensaje y compara respuestas reales."],
  ["música","♫","Comparte 2 fragmentos musicales y pregunta cuál recordarían."],
  ["arte","✳","Muestra 2 piezas o conceptos y pregunta qué emoción provocan."],
  ["diseño","◇","Presenta 2 bocetos y observa cuál se entiende más rápido."],
  ["filmmaking","▶","Muestra 2 aperturas de video y pregunta cuál genera más interés."],
  ["fotografía","◉","Comparte 2 estilos fotográficos y registra cuál comunica mejor tu idea."],
  ["modelaje","✧","Presenta 2 conceptos de portafolio y pregunta cuál resulta más memorable."],
  ["media","▤","Prueba 2 titulares con 2 personas y mide cuál despierta curiosidad."],
  ["viajes","✈","Presenta 2 itinerarios y pregunta cuál reservarían y por qué."],
  ["hospedaje","⌂","Compara 2 propuestas de estancia y descubre qué atributo valoran más."],
  ["wellness","☼","Explica una rutina de bienestar y pregunta qué barrera impediría probarla."],
  ["fitness","↟","Comparte una rutina breve y registra qué ejercicio genera más dudas."],
  ["pets","♡","Presenta una solución para mascotas a 2 cuidadores y registra necesidades reales."],
  ["gastronomía","♨","Muestra 2 propuestas de menú y pregunta cuál probarían primero."],
  ["restaurantes","♜","Presenta 2 experiencias gastronómicas y pregunta qué motivaría una visita."],
  ["terrazas","☀","Muestra 2 ambientes y pregunta cuál elegirían para reunirse."],
  ["bares","◐","Compara 2 conceptos de bar y pregunta cuál visitarían y por qué."],
  ["clubs","✦","Presenta 2 conceptos de noche y pregunta cuál les atrae más."],
  ["venues","⌘","Muestra 2 configuraciones de evento y pregunta cuál resuelve mejor su necesidad."],
  ["artistas posicionados","★","Prueba 2 propuestas de colaboración y registra qué valor perciben."],
  ["marcas posicionadas","◆","Presenta 2 ideas de campaña y pregunta cuál se alinea mejor con la marca."]
];
const mission05Normalize = (value) => String(value || "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/* M05 image registry: replace any WebP without changing category logic. */
const mission05ImageRegistry = [
  ["negocios", "assets/mission05/negocios.webp"],
  ["tecnologia", "assets/mission05/tecnologia.webp"],
  ["software", "assets/mission05/software.webp"],
  ["inversiones", "assets/mission05/inversiones.webp"],
  ["emprendimiento", "assets/mission05/emprendimiento.webp"],
  ["contenido", "assets/mission05/contenido.webp"],
  ["musica", "assets/mission05/musica.webp"],
  ["arte", "assets/mission05/arte.webp"],
  ["diseno", "assets/mission05/diseno.webp"],
  ["filmmaking", "assets/mission05/filmmaking.webp"],
  ["fotografia", "assets/mission05/fotografia.webp"],
  ["modelaje", "assets/mission05/modelaje.webp"],
  ["media", "assets/mission05/media.webp"],
  ["viajeros", "assets/mission05/viajes.webp"],
  ["hospedaje", "assets/mission05/hospedaje.webp"],
  ["wellness", "assets/mission05/wellness.webp"],
  ["fitness", "assets/mission05/fitness.webp"],
  ["pets", "assets/mission05/pets.webp"],
  ["gastronomia", "assets/mission05/gastronomia.webp"],
  ["restaurantes", "assets/mission05/restaurantes.webp"],
  ["terrazas", "assets/mission05/terrazas.webp"],
  ["bares", "assets/mission05/bares.webp"],
  ["clubs", "assets/mission05/clubs.webp"],
  ["venues", "assets/mission05/venues.webp"],
  ["artistas posicionados", "assets/mission05/artistas-posicionados.webp"],
  ["marcas posicionadas", "assets/mission05/marcas-posicionadas.webp"],
];
function mission05ImageFor(name) {
  const normalized = mission05Normalize(name);
  // Exact or beginning match first; avoids accidental matches within other words.
  const match = mission05ImageRegistry.find(([key]) => normalized === key || normalized.startsWith(key + " ") || normalized.startsWith(key + " (") );
  return match?.[1] || null;
}

let mission05Selected = null;


function mission05RenderActivity(category, experiment) {

  const target = document.getElementById("mission05Activity");

  if (!target) {
    console.error("M05: contenedor de actividad no encontrado.");
    return;
  }

  if (typeof window.JLM05Wizard?.start !== "function") {
    console.error("M05: mission05-wizard.js no está cargado.");
    return;
  }

  target.classList.add("jl-m05-activity");

 
window.JLM05Wizard.start(category, experiment, {
  projectId: currentProject?.id,
  supabase: supabaseClient
});

} 

async function openMission05() {
  const panel = document.getElementById("mission05Panel");
  const grid = document.getElementById("mission05Categories");
  const feedback = document.getElementById("mission05Feedback");
  const count = document.getElementById("mission05Count");
  if (!panel || !grid) {
    console.error("M05: panel o cuadrícula no encontrados en account.html");
    return;
  }
  openDashboardView("missions");
  panel.hidden = false;
  if (!currentUser || !currentProject) {
    const message = document.getElementById("mission05Feedback");
    if (message) message.textContent = "La sesión o el proyecto todavía no están disponibles. Recarga la página.";
    return;
  }
  panel.hidden = false;
  grid.replaceChildren();
  if (feedback) feedback.textContent = "Cargando categorías activas...";
  const {data, error} = await supabaseClient.from("categories")
    .select("id,name,group_name,sort_order").eq("active",true)
    .order("sort_order",{ascending:true});
  if (error) {
    if (feedback) feedback.textContent = "No se pudieron cargar las categorías. Intenta nuevamente.";
    console.error("M05 categories:", error);
    return;
  }
  if (count) count.textContent = `${data.length} CATEGORÍAS`;
  if (feedback) feedback.textContent = data.length ? "Selecciona una tarjeta para descubrir tu prueba." : "No hay categorías activas.";
  data.forEach((category, index) => {
    const normalized = mission05Normalize(category.name);
    const matching = mission05Catalog.find(([key]) => normalized.includes(key));
    const symbol = matching?.[1] || "◇";
    const experiment = matching?.[2] || "Presenta tu concepto a 2 personas y registra qué cambiarían.";
    const card = document.createElement("button");
    card.type = "button";
    card.className = "jl-m05-card";
    const imagePath = mission05ImageFor(category.name);
    if (imagePath) {
      const media = document.createElement("span");
      media.className = "jl-m05-card-media";
      const photo = document.createElement("img");
      photo.src = imagePath;
      photo.alt = ""; // Category name is already readable text in the card.
      photo.loading = "lazy";
      photo.decoding = "async";
      photo.addEventListener("error", () => media.classList.add("is-missing"), {once:true});
      media.append(photo);
      card.append(media);
    }
    card.dataset.categoryId = category.id;
    card.setAttribute("aria-pressed", "false");
    const num = document.createElement("span");
    num.className = "jl-m05-card-num";
    num.textContent = String(index+1).padStart(2,"0");
    const glyph = document.createElement("span");
    glyph.className = "jl-m05-card-glyph";
    glyph.textContent = symbol;
    glyph.setAttribute("aria-hidden","true");
    const name = document.createElement("strong");
    name.textContent = category.name;
    const group = document.createElement("small");
    group.textContent = category.group_name || "EXPERIMENT";
    const arrow = document.createElement("span");
    arrow.className = "jl-m05-card-arrow";
    arrow.textContent = "EXPLORE ↗";
    card.append(num,glyph,name,group,arrow);
    card.addEventListener("click", () => {
      grid.querySelectorAll(".jl-m05-card").forEach(el => {
        el.classList.remove("is-selected");
        el.setAttribute("aria-pressed","false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed","true");
      mission05Selected = category.id;
      mission05RenderActivity(category,experiment);
      if (feedback) feedback.textContent = `Categoría seleccionada: ${category.name}`;
      document.getElementById("mission05Activity")?.scrollIntoView({behavior:"smooth",block:"nearest"});
    });
    grid.appendChild(card);
  });
  panel.scrollIntoView({behavior:"smooth",block:"start"});
}

// M05 preview entry; does not alter the M04 completion flow.
document.getElementById("openMission05Preview")?.addEventListener("click", () => {
  openMission05().catch(error => console.error("Error abriendo M05:", error));
});
