"use strict";(()=>{var e={};e.id=4606,e.ids=[4606],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8086:e=>{e.exports=require("module")},10317:(e,r,a)=>{a.d(r,{J:()=>u,k:()=>p});var t=a(49526),s=a(86890);let i=t.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:"465"===process.env.SMTP_PORT,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}),n=process.env.EMAIL_FROM||`noreply@${"http://localhost:9008".replace(/^https?:\/\//,"")}`;async function o({to:e,subject:r,html:a,text:t}){try{let o=await i.sendMail({from:`"${s.C3}" <${n}>`,to:e,subject:r,html:a,text:t||a.replace(/<[^>]*>?/gm,"")});console.log("Email terkirim: %s",o.messageId)}catch(r){throw console.error("Error mengirim email:",r),Error(`Gagal mengirim email ke ${e}: ${r.message}`)}}async function p(e,r,a){let t=`Verifikasi Email Anda untuk ${s.C3}`,i=`
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Selamat Datang di ${s.C3}, ${r||"Pengguna Baru"}!</h2>
      <p>Terima kasih telah mendaftar. Silakan klik tautan di bawah ini untuk memverifikasi alamat email Anda:</p>
      <p style="margin: 20px 0;">
        <a href="${a}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verifikasi Email Saya
        </a>
      </p>
      <p>Jika Anda tidak bisa mengklik tombol di atas, salin dan tempel URL berikut ke browser Anda:</p>
      <p><a href="${a}">${a}</a></p>
      <p>Jika Anda tidak mendaftar untuk akun ini, Anda bisa mengabaikan email ini.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.9em; color: #777;">Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
    </div>
  `;await o({to:e,subject:t,html:i})}async function u(e,r){let a=`Reset Kata Sandi Akun ${s.C3} Anda`,t=`
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Permintaan Reset Kata Sandi</h2>
      <p>Kami menerima permintaan untuk mereset kata sandi akun Anda di ${s.C3}.</p>
      <p>Silakan klik tautan di bawah ini untuk membuat kata sandi baru:</p>
      <p style="margin: 20px 0;">
        <a href="${r}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Kata Sandi
        </a>
      </p>
      <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
      <p>Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.9em; color: #777;">Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
    </div>
  `;await o({to:e,subject:a,html:t})}},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13066:(e,r,a)=>{a.r(r),a.d(r,{patchFetch:()=>y,routeModule:()=>g,serverHooks:()=>v,workAsyncStorage:()=>q,workUnitAsyncStorage:()=>w});var t={};a.r(t),a.d(t,{POST:()=>f});var s=a(96559),i=a(48088),n=a(37719);a(99180);var o=a(32190),p=a(98765),u=a(93019),d=a(55511),l=a.n(d),m=a(85665),x=a.n(m),k=a(70762),c=a(10317);let h=k.Ik({email:k.Yj().email({message:"Alamat email tidak valid."})});async function f(e){try{let r=await e.json(),a=h.safeParse(r);if(!a.success)return o.NextResponse.json({message:"Input tidak valid.",errors:a.error.flatten().fieldErrors},{status:400});let{email:t}=a.data,s=(await (0,p.A)()).getRepository(u.v),i=await s.findOne({where:{email:t}});if(!i)return console.log(`Password reset requested for non-existent email: ${t}`),o.NextResponse.json({message:"Jika email terdaftar, instruksi reset akan dikirim."},{status:200});let n=l().randomBytes(32).toString("hex"),d=await x().hash(n,10),m=new Date(Date.now()+36e5);i.resetPasswordToken=d,i.resetPasswordExpires=m,await s.save(i);let k=`http://localhost:9008/reset-password?token=${n}&email=${encodeURIComponent(t)}`;return await (0,c.J)(t,k),o.NextResponse.json({message:"Jika email terdaftar, instruksi reset akan dikirim.",demoResetToken:n},{status:200})}catch(e){return console.error("Request password reset error:",e),o.NextResponse.json({message:"Terjadi kesalahan internal server."},{status:500})}}let g=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/auth/request-password-reset/route",pathname:"/api/auth/request-password-reset",filename:"route",bundlePath:"app/api/auth/request-password-reset/route"},resolvedPagePath:"/home/user/studio/src/app/api/auth/request-password-reset/route.ts",nextConfigOutput:"",userland:t}),{workAsyncStorage:q,workUnitAsyncStorage:w,serverHooks:v}=g;function y(){return(0,n.patchFetch)({workAsyncStorage:q,workUnitAsyncStorage:w})}},21820:e=>{e.exports=require("os")},27910:e=>{e.exports=require("stream")},28354:e=>{e.exports=require("util")},29021:e=>{e.exports=require("fs")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{e.exports=require("path")},34631:e=>{e.exports=require("tls")},37366:e=>{e.exports=require("dns")},42449:e=>{e.exports=require("pg")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},46193:e=>{e.exports=require("node:string_decoder")},51455:e=>{e.exports=require("node:fs/promises")},55511:e=>{e.exports=require("crypto")},55591:e=>{e.exports=require("https")},57075:e=>{e.exports=require("node:stream")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73024:e=>{e.exports=require("node:fs")},73136:e=>{e.exports=require("node:url")},74075:e=>{e.exports=require("zlib")},76760:e=>{e.exports=require("node:path")},78474:e=>{e.exports=require("node:events")},79428:e=>{e.exports=require("buffer")},79551:e=>{e.exports=require("url")},79646:e=>{e.exports=require("child_process")},79748:e=>{e.exports=require("fs/promises")},81630:e=>{e.exports=require("http")},83997:e=>{e.exports=require("tty")},91645:e=>{e.exports=require("net")},94735:e=>{e.exports=require("events")}};var r=require("../../../../webpack-runtime.js");r.C(e);var a=e=>r(r.s=e),t=r.X(0,[4447,580,9013,8117,762,5665,9526,1580],()=>a(13066));module.exports=t})();