

// DATA
const users = []; // (username, password y role )
let currentUser = null;

const ROLES = {client:"client", employee:"employee", storeOwner:"storeOwner"};

const slots = []; // slots: (id, date, time, status, owner, pet, createdBy)
// slot.status = "booked", "free"

const SETTINGS = {
  days:7,
  times:["09:00","10:00","11:00","14:00","15:00","16:00"]
};


// HELPERS
function pad2(n){return String(n).padStart(2,"0");}
function cleanText(s){return (s??"").trim();}

function toISODate(d){
  const y = d.getFullYear();
  const m = pad2(d.getMonth()+1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}


// CREADOR DE SLOTS/TURNOS
function buildSlots(){
  if(slots.length>0)return;

  const today = new Date();
  let id = 1;

  // slots: (id, date, time, status, owner, pet, createdBy)
  for(let i = 0;i<SETTINGS.days;i++){
    const d = new Date(today);
    d.setDate(today.getDate()+i);
    const date = toISODate(d);

    for(let t = 0;t<SETTINGS.times.length;t++){
      slots.push({
        id:pad2(id++),
        date,
        time:SETTINGS.times[t],
        status:"free",
        owner:"",
        pet:"",
        createdBy:""
      });
    }
  }

  console.log("Slots creados:",slots.length);
}


// 1) INGRESO
function getBookingInput(){
  const owner = cleanText ( prompt ( "Ingrese su nombre:" ) );
  const pet = cleanText ( prompt ( "Ingrese el nombre de su Mascota:" ) );

  if( !owner || !pet ){
    let msg = "Error de datos; turno no agendado.\n\n";
    if( !owner )msg+= "- Falta nombre de dueño\n";
    if( !pet )msg+= "- Falta nombre de mascota\n";
    alert( msg );
    return null;
  }

  return { owner, pet };
}

// 2) PROCESO
function bookSlot( slot, data ){
  slot.status = "booked";
  slot.owner = data.owner;
  slot.pet = data.pet;
  slot.createdBy = currentUser.username;
  return slot;
}

// 3) EGRESO
function showBookedSlot(slot){
  alert(
    "Turno agendado ✅\n\n"+
    `ID: #${slot.id}\n`+
    `Cuándo: ${slot.date} ${slot.time}\n`+
    `Dueño: ${slot.owner}\n`+
    `Mascota: ${slot.pet}`
  );
  console.log("[turno agendado]",slot);
}


// GESTION DE USUARIOS

// USUARIOS DE PRUEBA

const PREEXISTING_USERS=[
  { username: "Cliente", password: "Cliente01", role: "client" }, 
  { username: "Empleado", password: "Empleado01", role: "employee" }, 
  { username: "Owner", password: "Owner01", role: "storeOwner" }
];

function loadPreexistingUsers(){
  // Evita duplicar si ya se cargaron
  if(users.length>0)return;

  for(let i=0; i < PREEXISTING_USERS.length; i++){
    const u = PREEXISTING_USERS[i];
    users.push({
      username: u.username,
      password: u.password,
      role :ROLES[u.role]
    });
  }

  console.log("[auth] Usuarios de prueba cargados:",users.length);
}

// REGISTRARSE
function registerUser(){
  alert("Registro de usuario");

  const username = cleanText( prompt( "Nombre de Usuario:" ) );
  if( !username ){ alert( "Nombre de Usuario inválido." ); return false; }

  const exists = users.some(u => u.username  ===  username);
  if( exists ){ alert( "Nombre de Usuario ya existe." ); return false; }

  const password = cleanText( prompt( "Password:" ) );
  if( !password ) { alert( "Password inválida." ); return false; }
  
  const role = ROLES.client;
  users.push( { username,password,role } );

  console.log( "[auth] Usuario creado:", username );
  alert( `Usuario creado: ${username}` );
  return true;
}

// LOGEARSE
function login(){
  if( users.length  ===  0 ){
    const ok = confirm("No hay usuarios. ¿Desea crear un usuario?");
    if( !ok )return false;
    if(!registerUser())return false;
  }
  
  alert( "Login" );
  const username = cleanText( prompt( "Nombre de Usuario:" ) );
  const password = cleanText( prompt( "Contraseña:" ) );

  const user = users.find(u => u.username === username && u.password === password);
  if(!user) {
    alert(
      "Nombre de Usuario o Contraseña con error.\n\n"+
      "Para probar Cliente: Usuario=Cliente | Contraseña=Cliente01\n"+
      "Para probar Empleado: Usuario=Empleado | Contraseña=Empleado01\n"+
      "Para probar Dueño: Usuario=Owner | Contraseña=Owner01"
    );
    return false;
  }

  currentUser=user;
  console.log("[auth] Logueado:",currentUser);
  alert(`Bienvenido, ${currentUser.username} (${currentUser.role})`);
  return true;
}

function logout(){
  currentUser=null;
  alert("Sesión cerrada.");
}

// permisos segun role
function isStaff(){
  return currentUser && (currentUser.role === ROLES.employee || currentUser.role === ROLES.storeOwner);
}

function canManageSlot(slot){
  if(!currentUser)return false;
  if(isStaff())return true;
  return slot.createdBy===currentUser.username;
}


// TURNOS
function listFreeSlots(){
  const free=slots.filter(s=>s.status === "free");
  if(free.length === 0){alert("No hay turnos disponibles.");return;}

  const view=free.slice(0,20);
  let msg="Turnos disponibles (primeros 20)\n\n";
  for(let i=0;i<view.length;i++){
    msg+=`${i+1}) #${view[i].id} - ${view[i].date} ${view[i].time}\n`;
  }
  alert(msg);
  console.log("[turnos disponibles]",free);
}

function listBookedSlots(){
  const booked=slots.filter(s=>s.status==="booked");
  if(booked.length===0){alert("No hay turnos agendados aún.");return;}

  const visible=isStaff()?booked:booked.filter(s=>s.createdBy===currentUser.username);
  if(visible.length===0){alert("No tenés turnos agendados.");return;}

  let msg=isStaff()?"Turnos agendados (todos)\n\n":"Mis turnos agendados\n\n";
  for(let i=0;i<visible.length;i++){
    const s=visible[i];
    const extra=isStaff()?` — Reservado por: ${s.createdBy}`:"";
    msg+=`#${s.id} - ${s.date} ${s.time} — ${s.owner} / ${s.pet}${extra}\n`;
  }

  alert(msg);
  console.log("[turnos agendados]",visible);
}


function pickFreeSlot(){
  const free=slots.filter(s=>s.status === "free");
  if(free.length === 0)return null;

  const view=free.slice(0,20);
  let msg="Elegir un turno (1-20)\n\n";
  for(let i=0;i<view.length;i++){
    msg+=`${i+1}) #${view[i].id} - ${view[i].date} ${view[i].time}\n`;
  }

  const n=Number(prompt(msg));
  if(!Number.isFinite(n)||n<1||n>view.length){
    alert("Selección errónea.");
    return null;
  }
  return view[n-1];
}

function findBookedById(){
  const id=cleanText(prompt("Ingrese la id del turno agendado (ej: 01):"));
  if(!id){alert("ID erróneo.");return null;}

  const s=slots.find(x=>x.id===id&&x.status==="booked");
  if(!s){alert("Turno no encontrado.");return null;}

  if(!canManageSlot(s)){
    alert("No tenés permisos para ver/editar este turno.");
    return null;
  }

  return s;
}


function createBooking(){
  if(!currentUser){alert("Debes loguearte.");return;}

  const slot = pickFreeSlot();
  if(!slot)return;

  const data = getBookingInput();
  if(!data)return;

  const ok = confirm(
    "Confirmar turno?\n\n"+
    `Cuándo: ${slot.date} ${slot.time}\n`+
    `Dueño: ${data.owner}\n`+
    `Mascota: ${data.pet}\n`
  );
  if(!ok){alert("Turno cancelado.");return;}

  const booked=bookSlot(slot,data);
  showBookedSlot(booked);
}

function editBooking(){
  if( !currentUser ){alert( "Debes estar logueado." );return;}

  const booked = findBookedById();
  if(!booked)return;

  const option = prompt(
    `Editar turno #${booked.id}\n\n`+
    `1) Cambiar datos (dueño/Mascota)\n`+
    `2) Cambiar horario (mover a un turno libre)\n`+
    `0) Volver`
  );

  if(option === "1"){
    const newOwner = cleanText( prompt( `Dueño actual: ${booked.owner}\nNuevo dueño (Enter para mantener):` ) );
    const newpet = cleanText( prompt( `Mascota actual: ${booked.pet}\nNuevo mascota (Enter para mantener):` ) );

    if(newOwner)booked.owner=newOwner;
    if(newpet)booked.pet=newpet;

    console.log("[turno editado]",booked);
    alert("Turno actualizado ✅");
    return;
  }

  if(option === "2"){
    const newSlot=pickFreeSlot();
    if(!newSlot)return;

    const ok=confirm(
      "Confirmar cambio de horario?\n\n"+
      `De: #${booked.id} - ${booked.date} ${booked.time}\n`+
      `A:  #${newSlot.id} - ${newSlot.date} ${newSlot.time}`
    );
    if(!ok){alert("Cambio cancelado.");return;}

    // Copiar datos y liberar turno viejo
    const data={owner:booked.owner,pet:booked.pet,createdBy:booked.createdBy};

    booked.status="free";
    booked.owner="";
    booked.pet="";
    booked.createdBy="";

    // Ocupar nuevo slot con los mismos datos
    newSlot.status="booked";
    newSlot.owner=data.owner;
    newSlot.pet=data.pet;
    newSlot.createdBy=data.createdBy;

    console.log("[turno movido]",{ from:booked, to:newSlot });
    alert( "Turno cambiado ✅" );
    return;
  }

  // Cualquier otra opción: no hacer nada
  alert("Sin cambios.");
}

function cancelBooking(){
  if( !currentUser ) { alert( "Debes estar logueado." ); return; }

  const s = findBookedById();
  if( !s ) return;

  const ok = confirm(
    "Cancelar el turno?\n\n"+
    `#${s.id} - ${s.date} ${s.time}\n`+
    `${s.owner} / ${s.pet}\n`
  );
  if(!ok){alert("No cancelado.");return;}

  s.status="free";
  s.owner="";
  s.pet="";
  s.createdBy="";

  console.log("[turno cancelado]",s.id);
  alert("Turno cancelado ✅");
}


// MENU PRINCIPAL - ver enganche con html
function mainMenu(){
  let exit=false;

  while(!exit){
    const op=prompt(
      "Dogsen Spa - Menu\n\n"+
      `Usuario: ${currentUser??"—"}\n\n`+
      "1) Ver turnos disponibles\n"+
      "2) Agendar turno\n"+
      "3) Ver turnos agendados\n"+
      "4) Editar turno\n"+
      "5) Cancelar turno\n"+
      "6) Registrarse\n"+
      "7) Login\n"+
      "8) Cerrar sesión\n"+
      "0) Salir\n"
    );

    switch(op){
      case "1": listFreeSlots(); break;
      case "2": createBooking(); break;
      case "3": listBookedSlots(); break;
      case "4": editBooking(); break;
      case "5": cancelBooking(); break;
      case "6": registerUser(); break;
      case "7": login(); break;
      case "8": logout(); break;
      case "0": exit=true; break;
      default: alert("Opción inválida."); break;
    }
  }

  alert("Listo. Fin del simulador.");
}


// START
function start() {
  loadPreexistingUsers();
  buildSlots();
  console.log( "Simulador Dogsen Spa" );
  mainMenu();
}

start();
