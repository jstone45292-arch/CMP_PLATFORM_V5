async function saveMeasurement(){
 let error;

 if(editId){

  const oldRow=rows.find(r=>r.id===editId);

  const reason=prompt("수정 사유를 입력하세요.");

  if(!reason){
   alert("수정 사유가 필요합니다.");
   return;
  }

  const result=await supabase
   .from("measurements")
   .update({
    run_id:runId,
    particle_removal:Number(particleRemoval),
    contact_angle:Number(contactAngle),
    remark:remark
   })
   .eq("id",editId);

  error=result.error;

  if(!error){
   const userEmail=(await supabase.auth.getUser()).data.user?.email || "unknown";

   await supabase
    .from("measurement_revisions")
    .insert([
     {
      measurement_id:editId,
      edited_by:userEmail,
      reason:reason,
      before_value:{
       run_id:oldRow.run_id,
       particle_removal:oldRow.particle_removal,
       contact_angle:oldRow.contact_angle,
       remark:oldRow.remark
      },
      after_value:{
       run_id:runId,
       particle_removal:Number(particleRemoval),
       contact_angle:Number(contactAngle),
       remark:remark
      }
     }
    ]);
  }

 }else{

  const result=await supabase
   .from("measurements")
   .insert([
    {
     run_id:runId,
     particle_removal:Number(particleRemoval),
     contact_angle:Number(contactAngle),
     remark:remark
    }
   ]);

  error=result.error;
 }

 if(error){
  alert("저장 실패 : "+error.message);
 }else{
  alert(editId?"수정 완료":"저장 완료");

  setRunId("");
  setParticleRemoval("");
  setContactAngle("");
  setRemark("");
  setEditId(null);

  loadMeasurements();
 }
}