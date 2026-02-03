

// Data
const users = []; // {username,password}
let currentUser = null;

// slots: {id, date, time, status, owner, dog, service, createdBy}
const slots=[];

const SETTINGS={
  days:7,
  times:["09:00","10:00","11:00","14:00","15:00","16:00"]
};


// funciones helpers

function pad2(n){return String(n).padStart(2,"0");}
function cleanText(s){return (s??"").trim();}

function toISODate(d){
  const y=d.getFullYear();
  const m=pad2(d.getMonth()+1);
  const day=pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

// crear los slots

function buildSlots(){
  if(slots.length>0)return;

  const today=new Date();
  let id=1;

  for(let i=0;i<SETTINGS.days;i++){
    const d=new Date(today);
    d.setDate(today.getDate()+i);
    const date=toISODate(d);

    for(let t=0;t<SETTINGS.times.length;t++){
      slots.push({
        id:pad2(id++),
        date,
        time:SETTINGS.times[t],
        status:"free",
        owner:"",
        dog:"",
        service:"",
        createdBy:""
      });
    }
  }

  console.log("Slots creados:",slots.length);
}

// 1) input
function getBookingInput(){
  const owner=cleanText(prompt("Ingrese su nombre"));
  const dog=cleanText(prompt("Ingrese el nombre de su perro"));

  if(!owner||!dog){
    alert("Error de datos, turno no agendado.");
    return null;
  }

  return {owner,dog,service};
}

// 2) process
function bookSlot(slot, data){
  slot.status = "booked";
  slot.owner = data.owner;
  slot.dog = data.dog;
  slot.createdBy = currentUser;
  return slot;
}

// 3) output
function showBookedSlot(slot){
  alert(
    "Booked ✅\n\n"+
    `ID: #${slot.id}\n`+
    `When: ${slot.date} ${slot.time}\n`+
    `Owner: ${slot.owner}\n`+
    `Dog: ${slot.dog}`
  );
  console.log("[booked]",slot);
}
