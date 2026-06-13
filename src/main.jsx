import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import{Database,FileSpreadsheet,FlaskConical,Gauge,LogOut,Microscope,ShieldCheck,User,Users}from"lucide-react";
import{supabase,supabaseConfigured}from"./supabaseClient";
import"./style.css";

const localUsers=[
 {email:"advisor@cmp.local",name:"박진석 대표",role:"Advisor"},
 {email:"professor@cmp.local",name:"김태동 교수님",role:"Professor"},
 {email:"admin@cmp.local",name:"대학원생 Admin",role:"Admin"},
 {email:"student01@cmp.local",name:"학부생 1",role:"Student"},
 {email:"student02@cmp.local",name:"학부생 2",role:"Student"},
 {email:"student03@cmp.local",name:"학부생 3",role:"Student"}
];

function App(){
 const[session,setSession]=useState(null);
 const[localUser,setLocalUser]=useState(()=>JSON.parse(localStorage.getItem("cmp_v5_local_user")||"null"));
 const[tab,setTab]=useState("dashboard");

 useEffect(()=>{
  if(!supabaseConfigured)return;
  supabase.auth.getSession().then(({data})=>setSession(data.session));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSession(session));
  return()=>subscription.unsubscribe();
 },[]);

 if(!supabaseConfigured) return <LocalMode user={localUser} setUser={setLocalUser} tab={tab} setTab={setTab}/>;
 if(!session) return <LoginCloud/>;
 return <CloudMode session={session} tab={tab} setTab={setTab}/>;
}

function LoginCloud(){
 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[msg,setMsg]=useState("");

 async function signIn(){
  setMsg("로그인 중...");
  const {error}=await supabase.auth.signInWithPassword({email,password});
  setMsg(error?error.message:"로그인 성공");
 }

 return <div className="app"><div className="container">
  <Header title="CMP Platform v5.0 Cloud" sub="Supabase 로그인"/>
  <div className="card" style={{marginTop:16}}>
   <h2>로그인</h2>
   <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="advisor@..."/>
   <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
   <button className="btn" onClick={signIn}>로그인</button>
   <p className="subtle">{msg}</p>
   <div className="warn">Supabase에서 6명 계정을 먼저 만들어야 합니다.</div>
  </div>
 </div></div>
}

function LocalMode({user,setUser,tab,setTab}){
 if(!user)return <div className="app"><div className="container">
  <Header title="CMP Platform v5.0 Cloud Package" sub="Supabase 설정 전 로컬 데모 모드"/>
  <div className="grid cols3">
   {localUsers.map(u=>
    <div className="card" key={u.email}
      onClick={()=>{
       setUser(u);
       localStorage.setItem("cmp_v5_local_user",JSON.stringify(u));
      }}
      style={{cursor:"pointer"}}>
      <h2>{u.name}</h2>
      <span className="badge">{u.role}</span>
      <p className="subtle">{u.email}</p>
    </div>
   )}
  </div>
  <div className="note">.env에 Supabase URL/KEY를 넣으면 클라우드 모드로 전환됩니다.</div>
 </div></div>

 return <Shell
   user={user}
   tab={tab}
   setTab={setTab}
   logout={()=>{
    localStorage.removeItem("cmp_v5_local_user");
    setUser(null);
   }}
   cloud={false}
 />;
}

function CloudMode({session,tab,setTab}){
 const user={
  name:session.user.email,
  role:"Cloud User",
  email:session.user.email
 };

 return <Shell
   user={user}
   tab={tab}
   setTab={setTab}
   logout={()=>supabase.auth.signOut()}
   cloud={true}
 />;
}

function Shell({user,tab,setTab,logout,cloud}){

 const tabs=[
  "dashboard",
  "users",
  "materials",
  "sop",
  "slurry",
  "doe",
  "measure",
  "memo",
  "rules"
 ];

 return <div className="app"><div className="container">

  <header className="header">
   <div>
    <h1>CMP Platform v5.0 Cloud</h1>
    <p>{cloud?"Cloud DB 연결":"Local demo mode"} · 6 Users · Lab Operation</p>
   </div>

   <div>
    <span className="badge green">{user.name}</span>
    <span className="badge purple">{user.role}</span>

    <button className="btn secondary" onClick={logout}>
      <LogOut size={16}/> 나가기
    </button>
   </div>
  </header>

  <nav className="tabs">
   {tabs.map(t=>
    <button
      key={t}
      className={"tab "+(tab===t?"active":"")}
      onClick={()=>setTab(t)}
    >
      {t.toUpperCase()}
    </button>
   )}
  </nav>

  {tab==="dashboard"&&<Dashboard cloud={cloud}/>}
  {tab==="users"&&<UsersPage/>}
  {tab==="materials"&&<Materials cloud={cloud}/>}
  {tab==="sop"&&<Simple title="SOP" icon={<ShieldCheck/>} text="Manual Rubbing CMP-Mimic SOP"/>}
  {tab==="slurry"&&<Simple title="Mock Slurry" icon={<FlaskConical/>} text="MS-SiO2-02: 1.0 wt%, 80–100 nm, pH 10.5"/>}
  {tab==="doe"&&<DOE/>}
  {tab==="measure"&&<Measure/>}
  {tab==="memo"&&<Memo/>}
  {tab==="rules"&&<Rules/>}

 </div></div>
}

function Header({title,sub}){
 return <header className="header">
  <div>
   <h1>{title}</h1>
   <p>{sub}</p>
  </div>
  <span className="badge green">v5.0</span>
 </header>
}

function Dashboard({cloud}){

 const [latest,setLatest]=useState(null);

 useEffect(()=>{
  if(cloud) load();
 },[]);

 async function load(){

  const {data,error}=await supabase
   .from("measurements")
   .select("*")
   .order("id",{ascending:false})
   .limit(1);

  if(!error && data?.length){
   setLatest(data[0]);
  }
 }

 return (
  <div className="grid cols2">

   <div className="card">
    <h2><Database size={20}/> Database 상태</h2>
    <p className="subtle">
      {cloud ? "Supabase Cloud 연결 모드" : "로컬 데모 모드"}
    </p>
   </div>

   <div className="card">
    <h2><Microscope size={20}/> 최근 측정</h2>

    {latest ? (
      <>
        <p><b>{latest.run_id}</b></p>
        <p>Removal : {latest.particle_removal} %</p>
        <p>Angle : {latest.contact_angle} °</p>
      </>
    ) : (
      <p className="subtle">측정 데이터 없음</p>
    )}

   </div>

  </div>
 );
}

function UsersPage(){
 return <div className="card">
  <h2><Users/> 초기 6명</h2>
  <Table heads={["Name","Role","Email"]} rows={localUsers.map(u=>[u.name,u.role,u.email])}/>
 </div>
}

function Materials({cloud}){

 const[rows,setRows]=useState([]);

 useEffect(()=>{
  if(cloud)load();
 },[cloud]);

 async function load(){
  const {data}=await supabase
   .from("materials")
   .select("material_id,material_name,category,corrosion_risk");

  setRows((data||[]).map(r=>[
   r.material_id,
   r.material_name,
   r.category,
   r.corrosion_risk
  ]));
 }

 return <div className="card">
  <h2><Database/> Materials</h2>
  <Table heads={["ID","Material","Category","Corrosion Risk"]} rows={rows}/>
 </div>
}

function DOE(){
 return <div className="card">
  <h2><FileSpreadsheet/> DOE</h2>
 </div>
}

function Measure(){

 const[runId,setRunId]=useState("");
 const[particleRemoval,setParticleRemoval]=useState("");
 const[contactAngle,setContactAngle]=useState("");
 const[remark,setRemark]=useState("");

 async function saveMeasurement(){

  const {error}=await supabase
   .from("measurements")
   .insert([
    {
      run_id:runId,
      particle_removal:Number(particleRemoval),
      contact_angle:Number(contactAngle),
      remark:remark
    }
   ]);

  if(error){
   alert("저장 실패 : "+error.message);
  }else{
   alert("저장 완료");

   setRunId("");
   setParticleRemoval("");
   setContactAngle("");
   setRemark("");
  }
 }

 return <div className="card">

  <h2><Microscope/> Measurement</h2>

  <label>Run ID</label>
  <input
   value={runId}
   onChange={e=>setRunId(e.target.value)}
   placeholder="RUN-001"
  />

  <label>Particle Removal (%)</label>
  <input
   value={particleRemoval}
   onChange={e=>setParticleRemoval(e.target.value)}
  />

  <label>Contact Angle</label>
  <input
   value={contactAngle}
   onChange={e=>setContactAngle(e.target.value)}
  />

  <label>Remark</label>
  <textarea
   value={remark}
   onChange={e=>setRemark(e.target.value)}
  />

  <button className="btn" onClick={saveMeasurement}>
   저장 테스트
  </button>

 </div>
}

function Memo(){
 return <div className="card">
  <h2>Memo</h2>
 </div>
}

function Rules(){
 return <div className="card">
  <h2>Decision Rules</h2>
 </div>
}

function Simple({title,icon,text}){
 return <div className="card">
  <h2>{icon} {title}</h2>
  <p>{text}</p>
 </div>
}

function Table({heads,rows}){
 return <div className="tablewrap">
  <table>
   <thead>
    <tr>
     {heads.map(h=><th key={h}>{h}</th>)}
    </tr>
   </thead>
   <tbody>
    {rows.map((r,i)=>
      <tr key={i}>
       {r.map((c,j)=><td key={j}>{c}</td>)}
      </tr>
    )}
   </tbody>
  </table>
 </div>
}

createRoot(document.getElementById("root")).render(<App/>);
