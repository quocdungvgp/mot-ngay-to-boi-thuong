/* Một Ngày Làm Tổ Bồi Thường – bản 3D, có lồng tiếng và chơi nhiều người */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.random()*a.length|0];
const clamp=(v,a,b)=>v<a?a:v>b?b:v, dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=t=>String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FONT='"Be Vietnam Pro",system-ui,sans-serif';
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* =================== DỮ LIỆU =================== */
const MOC=['Trước 18/12/1980','Từ 18/12/1980 đến trước 15/10/1993','Từ 15/10/1993 đến trước 01/7/2014','Từ 01/7/2014 trở về sau'];
const KIND_NAME={moc:'Nguồn gốc đất',lan:'Lấn chiếm',xenket:'Đất xen kẹt',thuake:'Thừa kế'};
// Câu hỏi quyết định cho các loại hồ sơ đặc biệt. ok = đúng; fav = có lợi cho dân (dân ký ngay); fb = sếp nhận xét khi sai
const DECIDE={
 lan:{title:'Xử lý phần diện tích lấn chiếm',opts:[
  {t:'Bồi thường như đất ở cho toàn bộ diện tích hiện trạng',fav:1,fb:'Đền như đất ở cho phần lấn chiếm? Tiền ngân sách chứ đâu phải tiền nhà em!'},
  {t:'Không bồi thường về đất phần lấn chiếm; ghi nhận riêng công trình để Hội đồng xem xét hỗ trợ theo quy định',ok:1},
  {t:'Bỏ qua, không ghi phần lấn chiếm vào biên bản',fav:1,fb:'Biên bản không ghi phần lấn chiếm thì sau này lấy gì giải quyết? Thiếu sót nghiêm trọng!'}]},
 xenket:{title:'Xác định loại đất để bồi thường',opts:[
  {t:'Toàn bộ là đất ở như chủ hộ khai',fav:1,fb:'Giấy chứng nhận ghi rõ diện tích đất ở bao nhiêu, em ghi đất ở hết là sai loại đất!'},
  {t:'Đất ở theo giấy tờ; phần còn lại là đất nông nghiệp xen kẹt trong khu dân cư, bồi thường theo giá đất nông nghiệp kèm hỗ trợ theo quy định',ok:1},
  {t:'Đất ruộng bỏ hoang, không bồi thường gì hết',fb:'Đất có giấy tờ hẳn hoi mà không bồi thường? Dân kiện là thua chắc!'}]},
 thuake:{title:'Ai đứng tên nhận bồi thường?',opts:[
  {t:'Cho người con trưởng ký nhận hết, anh em tự chia',fav:1,fb:'Mấy đứa em nó gửi đơn lên rồi kìa! Đang tranh chấp mà cho một người nhận hết?'},
  {t:'Ghi nhận tranh chấp vào biên bản; tiền bồi thường tạm gửi, chi trả khi tranh chấp được giải quyết',ok:1},
  {t:'Chia đều cho các con ngay tại chỗ',fav:1,fb:'Không di chúc, không văn bản phân chia di sản, tòa chưa xử mà em tự chia là sao?'}]},
};
const ROLES=[
 {name:'Nhân viên hợp đồng',desc:'Lương ít, việc nhiều. Đi nhanh, bền sức.',speed:1.05,energyDecay:.85,patience:100,zone:1,w:30},
 {name:'Cán bộ địa chính 20 năm',desc:'Đo như máy. Nhưng đi chậm, đau lưng.',speed:.85,energyDecay:1.1,patience:120,zone:1.5,w:25},
 {name:'Thực tập sinh mới ra trường',desc:'Chạy nhanh, nóng tính, đo hay trật.',speed:1.2,energyDecay:.9,patience:70,zone:.75,w:25},
 {name:'Kế toán bị điều đi hỗ trợ',desc:'Chưa cầm thước bao giờ. Kiên nhẫn gần như vô hạn.',speed:1,energyDecay:1,patience:140,zone:.6,w:15},
 {name:'Tài khoản lỗi hệ thống.exe',desc:'Phần mềm bốc lỗi. Mọi chỉ số ngẫu nhiên.',random:true,w:5},
];
const NPCS={
 totruong:{x:825,y:338,name:'Chú Hai tổ trưởng',short:'Tổ trưởng',shirt:'#3f6b3a',hat:'cap',hatCol:'#2b2b2b'},
 batu:{x:435,y:694,name:'Bà Tư quán nước',short:'Bà Tư',shirt:'#c0577a',hat:'nonla',hatCol:'#e9d9a8'},
 xeom:{x:555,y:735,name:'Chú Năm xe ôm',short:'Chú Năm',shirt:'#2c6e91',hat:'helmet',hatCol:'#2e7d32'},
};
const CASES=[
 {kind:'moc',name:'Bà Năm Lựu',claim:'Tui ở đây từ thời Pháp thuộc lận đó con!',a:'totruong',aText:'Bà Năm về đây cất chòi năm 1977, tui nhớ vì năm đó tui đi nghĩa vụ.',bText:'Biên bản kiểm tra dân cư năm 1978 ghi có nhà bà Năm Lựu. Sổ mục kê 1985 đứng tên bà tại thửa này.',ans:0},
 {kind:'moc',name:'Ông Sáu Mập',claim:'Đất ông bà để lại, ở mấy đời rồi!',a:'xeom',aText:'Ổng mua giấy tay của ông Hai Lúa năm 1991, chính tui chở ổng đi làm giấy. Trước đó ổng ở Gò Vấp.',bText:'Biên lai thuế nhà đất năm 1992 đứng tên ông Sáu. Không có giấy tờ nào trước năm 1991.',ans:1},
 {kind:'moc',name:'Anh Bảy Grab',claim:'Em ở đây từ hồi còn học mẫu giáo anh ơi!',a:'batu',aText:'Thằng Bảy cưới vợ năm 2003, cưới xong là cất nhà liền. Tui bán nước đám cưới nó mà.',bText:'Hóa đơn tiền điện đầu tiên tại địa chỉ: tháng 3/2003. Ảnh vệ tinh năm 2002: đất trống.',ans:2},
 {kind:'moc',name:'Chị Tám Bún Bò',claim:'Quán chị ở đây lâu lắm rồi, ai cũng biết!',a:'totruong',aText:'Con Tám mua lại miếng đất này năm 2016, xây quán bán bún từ đó tới giờ.',bText:'Ảnh vệ tinh năm 2013 chỗ này còn cỏ mọc, không có công trình.',ans:3},
 {kind:'moc',name:'Ông Chín Cá Kiểng',claim:'Tui nuôi cá ở đây từ hồi chưa có điện!',a:'batu',aText:'Ông Chín về đây năm 1988, đào ao nuôi cá kiểng. Tui bán nước cho ổng mấy chục năm.',bText:'Sổ hộ khẩu nhập tại địa chỉ này năm 1988. Bản đồ 299 năm 1985: khu vực bỏ hoang, không ai đăng ký.',ans:1},
 {kind:'moc',name:'Cô Ba Bánh Canh',claim:'Cô sống ở đây từ lúc con chưa đẻ!',a:'xeom',aText:'Cô Ba bán bánh canh ở đây từ năm 1979, hồi đó tui mới đi bộ đội về.',bText:'Phiếu tổng điều tra dân số năm 1979 ghi nhận hộ cô Ba tại địa chỉ này.',ans:0},
 {kind:'moc',name:'Anh Út Hiền',claim:'Anh có giấy tờ đàng hoàng hết nha!',a:'totruong',aText:'Thằng Út dọn về năm 1995, mua lại của bà Hai Nhứt, có làm giấy tay.',bText:'Tờ khai thuế đất năm 1996 và bản đồ địa chính năm 2002 đều đứng tên anh Út Hiền.',ans:2},
 {kind:'moc',name:'Bác Mười Cây Kiểng',claim:'Bác ở từ năm 75, hỏi ai cũng biết!',a:'batu',aText:'Bác Mười hả? Năm 2015 ổng mới ở Bến Tre lên mua đất trồng kiểng. Năm đó con gái tui lấy chồng nên tui nhớ.',bText:'Hợp đồng chuyển nhượng viết tay ngày 12/3/2015. Ảnh vệ tinh năm 2014: đất trống.',ans:3},
 {kind:'lan',name:'Anh Tư Cà Phê Võng',claim:'Nhà anh xây đúng ranh, không lấn tấc nào!',a:'xeom',aText:'Năm 2018 thằng Tư đổ đá lấn ra mé rạch cả chục mét, cất chòi mắc võng bán cà phê.',bText:'Bản đồ địa chính: ranh thửa cách mép rạch khoảng 8 m. Ảnh vệ tinh 2017 chưa có phần nhà sát mép nước. Có biên bản vi phạm năm 2018.'},
 {kind:'lan',name:'Chị Hai Tạp Hóa',claim:'Cái mái hiên đó có từ đời ba chị!',a:'totruong',aText:'Con Hai nới mái ra lề đường rồi xây bít luôn hồi năm 2019, tổ dân phố có nhắc mà không nghe.',bText:'Giấy chứng nhận cấp năm 2010 ghi 60 m². Hiện trạng đo được 78 m², phần dư nằm trên hành lang đường.'},
 {kind:'xenket',name:'Ông Tám Vườn Dừa',claim:'Bốn trăm mét vuông đất thổ cư hết đó nghen!',a:'batu',aText:'Ông Tám ở căn nhà nhỏ phía trước, phía sau là vườn dừa với cái ao, trồng mấy chục năm rồi.',bText:'Giấy chứng nhận: đất ở 100 m², đất trồng cây lâu năm 300 m² trong cùng thửa. Khu vực nằm trong khu dân cư hiện hữu.'},
 {kind:'xenket',name:'Bà Sáu Rau Muống',claim:'Đất của tui, ai nói đất ruộng là tui kiện!',a:'totruong',aText:'Bà Sáu có cái ao rau muống kẹt giữa mấy dãy nhà, ngay phía sau nhà bả.',bText:'Sổ mục kê: đất ở 80 m², đất nuôi trồng thủy sản 150 m² liền kề, nằm lọt giữa khu dân cư.'},
 {kind:'thuake',name:'Gia đình ông Bảy Xệ',claim:'Anh Hai: “Tui là con trưởng, tui ký là được rồi!”',a:'totruong',aText:'Ông Bảy mất năm ngoái, không để di chúc. Ba anh em đang cãi nhau, nghe nói nộp đơn ra tòa rồi.',bText:'Giấy chứng nhận đứng tên ông Bảy Xệ (đã chết). Có đơn tranh chấp thừa kế đang được thụ lý. Chưa có văn bản phân chia di sản.'},
 {kind:'thuake',name:'Gia đình bà Mười Hai',claim:'Chị Út: “Má dặn miệng để đất cho em rồi!”',a:'xeom',aText:'Bà Mười Hai mất hai năm rồi. Mấy đứa con chia không xong, bữa trước còn cự nhau ngoài hẻm.',bText:'Giấy chứng nhận đứng tên bà Mười Hai (đã chết). Không có di chúc. Phường hòa giải không thành, có biên bản.'},
];
const COMPLAINTS={
 moc:[
  {q:'Giá bồi thường vầy sao tui mua được chỗ khác?',opts:[['Dạ con ghi ý kiến vào biên bản, kiến nghị Hội đồng xem lại đơn giá.',1],['Không ký thì cưỡng chế đó nha!',-1],['Thôi ký đại đi, ai cũng vậy hết.',0]]},
  {q:'Sao nhà bên kia có nền tái định cư mà tui chưa nghe gì?',opts:[['Dạ phương án tái định cư sẽ niêm yết công khai. Con ghi lại để Ban trả lời bằng văn bản.',1],['Chuyện nhà người ta, hỏi chi?',-1],['Con cũng không rõ nữa…',0]]},
  {q:'Ký cái này rồi có bị mất đất liền không đó?',opts:[['Dạ biên bản này chỉ ghi nhận hiện trạng, chưa phải quyết định thu hồi. Đọc kỹ rồi hẵng ký.',1],['Không ký thì con ghi là vắng mặt.',-1],['Chắc không sao đâu.',0]]}],
 lan:[
  {q:'Phần đó tui xây mấy trăm triệu, giờ không đền một đồng?',opts:[['Dạ con ghi nhận đầy đủ công trình, Hội đồng sẽ xem xét hỗ trợ theo quy định và trả lời bằng văn bản.',1],['Ai biểu xây lấn chi giờ than!',-1],['Thì ráng chịu chứ sao…',0]]},
  {q:'Cả xóm ai cũng lấn, sao bắt mình tui?',opts:[['Dạ hộ nào lấn cũng ghi nhận như nhau, con làm đúng quy định cho cả khu.',1],['Ai lấn thì người đó chịu.',-1],['Con chỉ làm theo lệnh thôi.',0]]}],
 xenket:[
  {q:'Sao nhà kế bên được tính đất ở hết còn tui thì không?',opts:[['Dạ mỗi thửa tính theo giấy tờ của thửa đó; phần đất nông nghiệp của mình còn được hỗ trợ thêm theo quy định.',1],['Thì giấy tờ ghi vậy, cãi gì nữa.',-1],['Chắc bên đó có quen ai…',0]]},
  {q:'Hỗ trợ là được bao nhiêu? Nói rõ coi!',opts:[['Dạ mức cụ thể nằm trong phương án, sẽ niêm yết công khai. Có thắc mắc mình gửi ý kiến, Ban trả lời bằng văn bản.',1],['Con đâu biết, hỏi sếp đi.',-1],['Chắc cũng kha khá.',0]]}],
 thuake:[
  {q:'Tạm gửi là chừng nào mới lấy được tiền?',opts:[['Dạ khi tòa giải quyết xong, hoặc anh chị em có văn bản thỏa thuận phân chia hợp lệ, Ban chi trả liền.',1],['Chừng nào xong thì xong.',-1],['Chắc vài tháng thôi.',0]]},
  {q:'Ba tui để đất cho tui, mấy đứa kia không có phần!',opts:[['Dạ chuyện chia thừa kế do tòa hoặc thỏa thuận anh chị em quyết định; con chỉ ghi nhận đúng hiện trạng tranh chấp.',1],['Vậy ra tòa mà cãi.',-1],['Dạ con cũng nghĩ vậy.',0]]}],
};
const HOUSE_LINES=['Nhà tui chưa tới lượt hả? Vậy đi chỗ khác chơi.','Cán bộ uống miếng nước không?','Nghe nói đất tui được giá cao lắm phải hông?','(Cửa khóa. Có tờ giấy dán: Đi đám giỗ.)','Chừng nào bồi thường xong để tui còn tính?','(Chó trong nhà sủa inh ỏi. Không ai ra.)'];
const NPC_LINES={totruong:['Dự án nói hoài mà chưa thấy làm…','Tối nay họp tổ dân phố nha cán bộ.','Cần xác nhận gì cứ qua tui.'],xeom:['Đi đâu chở cho, hai chục.','Khu này tui rành từng con hẻm.','Nghe nói làm đường to lắm hả?']};
const BATU_LINES=['Uống miếng trà đá đi con, nắng quá.','Hôm qua có cán bộ khác ghé, ngồi tới trưa.','Chừng nào tới lượt đất nhà tui vậy?'];
const CITIZEN_LINES=['Sao đất tui bồi thường có bấy nhiêu? Giá thị trường gấp mấy lần!','Tui gửi đơn ba lần rồi sao chưa ai trả lời?','Ai cho mấy người đo đất nhà tui?','Nhà bên kia có nền tái định cư, sao tui không có?'];
const DODGE_LINES=['Né đẹp! Chủ nhà: “Nó hiền lắm, không cắn đâu!”','Né được! Ống quần còn nguyên.','Né! Hồ sơ không rớt tờ nào.'];

/* =================== THẾ GIỚI (tọa độ logic: 1 đơn vị = 1 px bản đồ) =================== */
const WW=1100,WH=1500,REAL_PER_MIN=.62,SC=.1;
const RH=[[260,330],[700,770],[1140,1210]],RV=[[120,190],[520,590],[900,970]];
const BLD=[
 {id:'office',x:215,y:50,w:280,h:180,col:'#d9c9a0',roof:'#8a2b1a',label:'BAN QLDA',door:[355,248]},
 {id:'ubnd',x:615,y:50,w:260,h:180,col:'#ecd27c',roof:'#b2241b',label:'UBND PHƯỜNG',door:[745,248]},
 {id:'cafe',x:10,y:350,w:100,h:100,col:'#8a6446',roof:'#3b2618',label:'CÀ PHÊ BỆT',door:[118,400]},
 {id:'banhmi',x:10,y:800,w:100,h:90,col:'#f0c05a',roof:'#c0392b',label:'BÁNH MÌ',door:[118,845]},
 {id:'tt',x:765,y:350,w:120,h:110,col:'#cfe0c3',roof:'#3f6b3a',label:'Tổ trưởng',door:null},
 {id:'quan',x:370,y:570,w:130,h:110,col:'#f3d9b1',roof:'#a35d2a',label:'Quán nước',door:null},
 {id:'vpkp',x:765,y:570,w:120,h:110,col:'#dfe3ea',roof:'#4a5a78',label:'VP khu phố',door:null},
 {id:'mieu',x:420,y:1270,w:80,h:70,col:'#e8c07a',roof:'#9c2a1c',label:'Miếu',door:null},
];
const HCOL=['#f6c7b6','#bfe1e8','#f4e3a1','#d7c8f0','#c8e6c0','#f2c6d8','#e9d3b5','#c5d6f2','#f7d2a6','#d4ecd9'];
[['h0',215,350,'up',12],['h1',370,350,'up',14],['h2',615,350,'up',27],['h3',215,570,'down',31],['h4',615,570,'down',45],
 ['h5',215,790,'up',52],['h6',370,790,'up',58],['h7',615,790,'up',63],['h8',765,790,'up',70],['h9',215,1235,'up',81]]
 .forEach(([id,x,y,side,num],i)=>{const w=id==='h8'?125:130,h=110;BLD.push({id,x,y,w,h,col:HCOL[i],roof:['#6d4a36','#8a3b2a','#4f5d6b'][i%3],label:'Số '+num,num,house:true,door:[x+w/2,side==='up'?y-10:y+h+12]});});
const TREES=[[55,110],[70,205],[990,80],[990,190],[990,420],[990,560],[990,650],[45,560],[65,650],[45,990],[75,1080],[990,850],[990,1000],[990,1100],[260,1000],[430,990],[680,1000],[830,1010],[100,1300],[60,1420],[300,1430],[470,1430],[990,1300],[260,1320]];
const DOGS0=[[705,312],[300,742],[330,1222]];
const ROAD_PTS=[];RV.forEach(([a,b])=>RH.forEach(([c,d])=>ROAD_PTS.push([(a+b)/2,(c+d)/2])));

/* =================== TRẠNG THÁI =================== */
let S=null,P=null,DOGS=[];
const keys={};
const joy={active:false,id:null,bx:0,by:0,dx:0,dy:0};
function newState(role){
 S={phase:'play',t:450,energy:100,food:75,pat:role.patience,patMax:role.patience,rep:50,done:0,failed:0,bitten:0,scolded:0,coffee:0,role,
    queue:shuffle(CASES.map((_,i)=>i)),usedHouses:[],cur:null,flood:0,nextCit:50,nextCall:80,citizen:null,ev:{},fainted:false,taskKey:'',near:null,signKey:''};
 P={x:355,y:280,fx:0,fy:1,dash:0,dashCd:0,inv:0,moving:false};
 DOGS=DOGS0.map(([x,y],i)=>({x,y,hx:x,hy:y,state:'idle',cd:4,ct:0,t:Math.random()*9,m:dogMeshes[i]}));
}
const isLunch=()=>S.t>=690&&S.t<810;
const inWater=(x,y)=>x>1010-S.flood*170||y>WH-S.flood*290;

function advance(dm){
 S.t+=dm;
 const ed=S.role.energyDecay*(S.food<20?1.8:1)*(inWater(P.x,P.y)?1.6:1);
 S.energy=clamp(S.energy-dm*.11*ed,0,100);
 S.food=clamp(S.food-dm*.12,0,100);
 const ev=(k,at,msg)=>{if(!S.ev[k]&&S.t>=at){S.ev[k]=1;toast(msg,3.6)}};
 ev('f1',630,'🌊 10:30 – Triều cường lên! Ven rạch ngập, đi chậm lại.');
 ev('l1',690,'🍚 11:30 – Nghỉ trưa! Ban QLDA và UBND đóng cửa tới 13:30.');
 ev('l2',810,'⏰ 13:30 – Vào ca chiều.');
 ev('f2',930,'🌊 15:30 – Triều lại lên rồi!');
 ev('lt',990,'⏳ 16:30 – Còn 30 phút. Nộp được gì nộp lẹ!');
}
const addTime=m=>advance(m);

/* =================== ÂM THANH & LỒNG TIẾNG =================== */
const SND={on:store.get('tbt_sound',true),voice:null};
const hasTTS='speechSynthesis' in window;
function pickVoice(){if(!hasTTS)return;const vs=speechSynthesis.getVoices();SND.voice=vs.find(v=>/^vi([-_]|$)/i.test(v.lang))||null;voiceInfo();}
if(hasTTS){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function voiceInfo(){const el=$('#voiceInfo');if(!el)return;
 el.textContent=!hasTTS?'Trình duyệt này không hỗ trợ đọc giọng nói; chỉ có hiệu ứng âm thanh.'
  :SND.voice?`Lồng tiếng: ${SND.voice.name}.`:'Máy chưa có giọng đọc tiếng Việt. Windows: Settings › Time & Language › Speech › thêm Tiếng Việt. Android: cài Google Text-to-Speech tiếng Việt.';}
const isFemale=n=>/^(Bà|Cô|Chị|Má|Gia đình bà)/.test(n);
const VPROF={sep:{p:.7,r:1},totruong:{p:.8,r:.95},batu:{p:1.35,r:.95},xeom:{p:.95,r:1.12},loc:{p:.75,r:1.25},f:{p:1.25,r:1.05},m:{p:.88,r:1.02},luutru:{p:1.1,r:1.15}};
function say(text,who){
 if(!SND.on||!hasTTS||!text)return;
 const clean=String(text).replace(/<[^>]+>/g,' ').replace(/[“”"()]/g,'').replace(/\s+/g,' ').trim();if(!clean)return;
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(clean);u.lang='vi-VN';if(SND.voice)u.voice=SND.voice;const p=VPROF[who]||VPROF.m;u.pitch=p.p;u.rate=p.r;speechSynthesis.speak(u);}catch(e){}
}
const hoVoice=n=>isFemale(n)?'f':'m';
let AC=null;
function audio(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function tone(f,d,type='sine',v=.15,when=0){const a=audio();if(!a||!SND.on)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+when;o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.03);}
const SFX={bark(){tone(430,.1,'sawtooth',.12);tone(330,.13,'sawtooth',.12,.16);},ring(){for(let i=0;i<3;i++){tone(880,.12,'sine',.12,i*.32);tone(660,.12,'sine',.12,i*.32+.15);}},
 stamp(){tone(80,.3,'triangle',.45);},ok(){tone(660,.1,'sine',.15);tone(990,.16,'sine',.15,.1);},bad(){tone(180,.3,'square',.08);},pop(){tone(520,.06,'sine',.08);}};

/* =================== GIAO DIỆN =================== */
let toastTimer=0;
function toast(msg,sec=2.6){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),sec*1000);}
function modal(o){
 if(S&&S.phase==='play')S.phase='modal';
 for(const k in keys)keys[k]=false;joy.active=false;
 $('#mtag').textContent=o.tag||'';
 $('#mtitle').textContent=o.title||'';
 $('#mbody').innerHTML=o.html||'';
 const bx=$('#mbtns');bx.innerHTML='';
 (o.buttons||[]).forEach(b=>{const e=document.createElement('button');e.textContent=b.t;if(b.cls)e.className=b.cls;e.onclick=()=>{SFX.pop();closeModal();if(b.f)b.f();};bx.appendChild(e);});
 const st=$('#mstamp');st.className='stamp';
 if(o.stamp){st.textContent=o.stamp;void st.offsetWidth;st.className='stamp on';setTimeout(SFX.stamp,120);}
 $('#modal').hidden=false;
 if(o.voice)say(o.voice[0],o.voice[1]);
 const first=bx.querySelector('button');if(first&&!isTouch)setTimeout(()=>first.focus({preventScroll:true}),30);
}
function closeModal(){$('#modal').hidden=true;if(hasTTS)try{speechSynthesis.cancel()}catch(e){}if(S&&S.phase==='modal')S.phase='play';}
function shakePaper(){const p=$('#paper');p.classList.remove('shake');void p.offsetWidth;p.classList.add('shake');}
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
const isTouch=matchMedia('(pointer:coarse)').matches;

/* =================== HÀNH ĐỘNG =================== */
const ITEMS=[];
for(const b of BLD)if(b.door)ITEMS.push({kind:'b',b,x:b.door[0],y:b.door[1]});
for(const k in NPCS)ITEMS.push({kind:'n',id:k,x:NPCS[k].x,y:NPCS[k].y});
function actLabel(it){
 if(it.kind==='n')return it.id==='batu'?'🧊 Bà Tư':'🗣 Hỏi chuyện';
 const id=it.b.id,c=S.cur;
 if(id==='office')return c&&c.signed?'📤 Nộp hồ sơ':'📁 Ban QLDA';
 if(id==='ubnd')return '🗄 Tra lưu trữ';
 if(id==='cafe')return '☕ Cà phê';
 if(id==='banhmi')return '🥖 Bánh mì';
 if(it.b.house){if(c&&c.hh===id){if(!c.measured)return '📐 Kiểm đếm';if(!c.signed)return '✍️ Biên bản';}return '🚪 Gõ cửa';}
 return 'Tương tác';
}
function doInteract(it){
 if(!it||!S||S.phase!=='play')return;
 audio();
 if(it.kind==='n')return talkNPC(it.id);
 const id=it.b.id;
 if(id==='office')return office();
 if(id==='ubnd')return archive();
 if(id==='cafe')return cafe();
 if(id==='banhmi')return banhmi();
 if(it.b.house)return house(it.b);
}
function assignCase(){
 if(S.t>=990){const v='Thôi mai làm tiếp. Ngồi viết báo cáo cuối ngày đi em.';return modal({tag:'Sếp',title:'Gần 5 giờ rồi',html:`<p>“${v}”</p>`,buttons:[{t:'Dạ'}],voice:[v,'sep']});}
 if(!S.queue.length)S.queue=shuffle(CASES.map((_,i)=>i));
 const cd=CASES[S.queue.pop()];
 let free=BLD.filter(b=>b.house&&!S.usedHouses.includes(b.id));
 if(!free.length){S.usedHouses=[];free=BLD.filter(b=>b.house);}
 const h=pick(free);S.usedHouses.push(h.id);
 S.cur={...cd,hh:h.id,num:h.num,measured:false,gotA:false,gotB:false,signed:false,chosen:-1,area:0,lied:false};
 const step4={moc:'Xác định thời điểm bắt đầu sử dụng đất',lan:'Xác định phần lấn chiếm và cách xử lý',xenket:'Xác định loại đất (đất ở, đất nông nghiệp)',thuake:'Xác định người nhận bồi thường khi đang tranh chấp'}[cd.kind];
 const v=`Em xuống ${cd.kind==='thuake'?'':'hộ '}${cd.name}, nhà số ${h.num}. Hồ sơ ${KIND_NAME[cd.kind].toLowerCase()}. Làm cho kỹ nha.`;
 modal({tag:'Phiếu giao việc · '+KIND_NAME[cd.kind],title:`${cd.name} – nhà số ${h.num}`,voice:[v,'sep'],
  html:`<p>Sếp: “${esc(v)}”</p><ol><li>Kiểm đếm hiện trạng</li><li>Hỏi người trong xóm (nghe nói <b>${NPCS[cd.a].name}</b> biết rõ)</li><li>Tra hồ sơ lưu trữ ở UBND phường</li><li>${step4}, lấy chữ ký biên bản</li><li>Mang về Ban lập phiếu trình</li></ol><p class="muted">Mũi tên vàng chỉ chỗ cần tới.</p>`,
  buttons:[{t:'Dạ em đi liền'}]});
 updateSigns();
}
function office(){
 if(isLunch())return toast('Ban QLDA nghỉ trưa. 13:30 quay lại.');
 const c=S.cur;
 if(!c)return assignCase();
 if(!c.signed){const v=`${c.name} còn dang dở kìa. Đi làm đi em!`;return modal({tag:'Sếp',title:'Chưa xong mà vô đây?',html:`<p>“${esc(v)}”</p>`,buttons:[{t:'Dạ em đi liền'}],voice:[v,'sep']});}
 addTime(10);
 let ok,result,fb='';
 if(c.kind==='moc'){ok=c.chosen===c.ans;result=MOC[c.chosen];if(!ok)fb=`Căn cứ một đằng, biên bản một nẻo! Mốc đúng phải là ${MOC[c.ans]}. Thanh tra xuống là chết cả đám!`;}
 else{const o=DECIDE[c.kind].opts[c.chosen];ok=!!o.ok;result=o.t;if(!ok)fb=o.fb+' Đáp án đúng: '+DECIDE[c.kind].opts.find(x=>x.ok).t+'.';}
 let d,msg,st;
 if(ok){d=30;msg='Căn cứ chặt chẽ. Anh ký trình Hội đồng.';
  if(c.lied){d-=15;msg+=' Mà hồi nãy em nói xong rồi, sao giờ mới đem lên? Lần sau báo cáo trung thực nha.';}
  if(c.kind!=='moc')d+=10;
  S.done++;st='ĐÃ DUYỆT';SFX.ok();}
 else{d=-25;msg=fb;S.failed++;st='TRẢ VỀ';SFX.bad();}
 S.rep+=d;S.cur=null;updateSigns();netState(true);
 modal({tag:'Phiếu trình · '+KIND_NAME[c.kind],title:`${c.name} – số ${c.num}`,stamp:st,voice:[msg,'sep'],
  html:`<div class="clue">Diện tích kiểm đếm: <b>${c.area} m²</b><br>${c.kind==='moc'?'Thời điểm sử dụng đất':'Đề xuất xử lý'}: <b>${esc(result)}</b></div><p>Sếp: “${esc(msg)}”</p><p class="muted">${d>0?'+':''}${d} uy tín</p>`,
  buttons:[{t:S.t<990?'Nhận hồ sơ tiếp':'Dạ',f:()=>{if(S.t<990)assignCase();}}]});
}
function archive(){
 if(isLunch())return toast('Bộ phận lưu trữ nghỉ trưa. Cửa khóa.');
 const c=S.cur;
 if(!c)return toast('Cán bộ lưu trữ: “Có công văn đâu mà tra?”');
 if(c.gotB)return toast('Hồ sơ photo rồi mà, tra chi nữa?');
 c.gotB=true;addTime(20);
 modal({tag:'Trích lục hồ sơ',title:`Lưu trữ – ${c.name}`,voice:[c.bText,'luutru'],html:`<div class="clue">${esc(c.bText)}</div><p class="muted">Lục kho mất 20 phút. Bụi quá, hắt xì ba cái.</p>`,buttons:[{t:'Photo mang theo'}]});
}
function cafe(){
 S.coffee++;addTime(10);S.energy=Math.min(100,S.energy+30);
 toast(S.coffee>3?`☕ Ly thứ ${S.coffee}… tim đập nhanh, run tay. Đo đạc khó hơn!`:'☕ Cà phê sữa đá. +30 năng lượng');
}
function banhmi(){addTime(8);S.food=Math.min(100,S.food+45);toast('🥖 Bánh mì thịt. +45 no bụng');}
function talkNPC(id){
 const n=NPCS[id],c=S.cur;
 if(c&&c.a===id&&!c.gotA){
  c.gotA=true;addTime(10);
  return modal({tag:'Ghi nhận ý kiến',title:n.name,voice:[c.aText,id],html:`<p>“${esc(c.aText)}”</p><p class="muted">Đã ghi vào sổ tay.</p>`,buttons:[{t:'Cảm ơn '+n.short}]});
 }
 if(id==='batu'){const l=pick(BATU_LINES);return modal({tag:'Quán nước',title:n.name,voice:[l,'batu'],html:`<p>“${l}”</p>`,buttons:[
  {t:'🧊 Uống ly trà đá (+năng lượng, +kiên nhẫn)',f:()=>{S.energy=Math.min(100,S.energy+12);S.pat=Math.min(S.patMax,S.pat+15);addTime(8);toast('Ực ực… mát ruột.');}},
  {t:'Thôi con đi tiếp'}]});}
 const l=pick(NPC_LINES[id]);toast(`${n.name}: “${l}”`);say(l,id);
}
function house(b){
 const c=S.cur;
 if(!c||c.hh!==b.id){const l=pick(HOUSE_LINES);toast(`Số ${b.num}: ${l}`);return say(l,Math.random()<.5?'f':'m');}
 if(c.signed)return toast('Biên bản ký rồi. Mang về Ban QLDA nộp!');
 if(isLunch()){const l='Ngủ trưa mà kêu gì! Một giờ rưỡi quay lại!';toast(`${c.name}: “${l}”`);return say(l,hoVoice(c.name));}
 if(!c.measured)return modal({tag:'Hiện trường · '+KIND_NAME[c.kind],title:c.name,voice:[c.claim,hoVoice(c.name)],
  html:`<p>“${esc(c.claim)}”</p><p class="muted">Bắt đầu kiểm đếm. Bấm CHỐT khi kim đỏ nằm trong vùng xanh. Cần đo 3 lần.</p>`,
  buttons:[{t:'📐 Bắt đầu đo',cls:'big',f:()=>measureGame(area=>{c.measured=true;c.area=area;addTime(25);SFX.ok();toast(`Kiểm đếm xong: ${area} m²`);})}]});
 if(!(c.gotA&&c.gotB)){
  const need=[];if(!c.gotA)need.push('ý kiến người trong xóm');if(!c.gotB)need.push('hồ sơ lưu trữ UBND');
  return modal({tag:'Hiện trường',title:c.name,voice:[c.claim,hoVoice(c.name)],html:`<p>“${esc(c.claim)}”</p><p class="muted">Chưa đủ căn cứ. Còn thiếu: ${need.join(', ')}.</p>`,buttons:[{t:'Dạ để con xác minh thêm'}]});
 }
 c.kind==='moc'?chooseMoc():chooseDecide();
}
function cluesHTML(c){return `<p class="muted">Chủ hộ khai: “${esc(c.claim)}”</p><div class="clue"><b>${NPCS[c.a].name}:</b> ${esc(c.aText)}</div><div class="clue"><b>Lưu trữ:</b> ${esc(c.bText)}</div>`;}
function chooseMoc(){
 const c=S.cur;
 modal({tag:'Biên bản làm việc',title:'Thời điểm bắt đầu sử dụng đất',html:cluesHTML(c)+'<p class="muted">Căn cứ các thông tin trên, ghi vào biên bản:</p>',buttons:MOC.map((m,i)=>({t:m,f:()=>pickMoc(i)}))});
}
function pickMoc(i){
 const c=S.cur;addTime(5);
 if(i>c.ans)return refuse(chooseMoc,'Ghi mốc muộn hơn thực tế, bất lợi cho dân nên họ không ký.');
 c.chosen=i;
 if(i<c.ans)return happySign();
 persuade();
}
function chooseDecide(){
 const c=S.cur,D=DECIDE[c.kind];
 const order=shuffle(D.opts.map((_,i)=>i));
 modal({tag:'Biên bản làm việc · '+KIND_NAME[c.kind],title:D.title,html:cluesHTML(c)+'<p class="muted">Căn cứ các thông tin trên, đề xuất xử lý:</p>',buttons:order.map(i=>({t:D.opts[i].t,f:()=>pickDecide(i)}))});
}
function pickDecide(i){
 const c=S.cur,o=DECIDE[c.kind].opts[i];addTime(5);
 if(!o.ok&&!o.fav)return refuse(chooseDecide,'Phương án này thiệt cho dân và không có căn cứ, họ không ký.');
 c.chosen=i;
 if(!o.ok)return happySign();
 persuade();
}
function refuse(back,why){
 const c=S.cur;S.pat-=10;SFX.bad();
 const v=c.kind==='thuake'?'Ghi vậy là sai! Tui không ký, tui đi kiện!':'Sai! Không đúng như vậy! Tui không ký!';
 modal({tag:'Căng rồi',title:`${c.name} nổi nóng`,voice:[v,hoVoice(c.name)],html:`<p>“${v}”</p><p class="muted">${why} −10 kiên nhẫn.</p>`,buttons:[{t:'Xem lại căn cứ',f:back}]});
}
function happySign(){
 const c=S.cur,v='Trời, cán bộ hiểu chuyện quá! Ký liền, ký liền!';
 modal({tag:'Hiện trường',title:c.name,voice:[v,hoVoice(c.name)],html:`<p>“${v}”</p>`,buttons:[{t:'✍️ Lấy chữ ký',f:()=>{c.signed=true;addTime(10);toast('Đã ký biên bản. Về Ban QLDA nộp!');}}]});
}
function persuade(){
 const c=S.cur,q=pick(COMPLAINTS[c.kind]);
 modal({tag:'Hiện trường',title:`${c.name} còn thắc mắc`,voice:[q.q,hoVoice(c.name)],html:`<p>“${esc(q.q)}”</p>`,
  buttons:shuffle(q.opts.slice()).map(([t,v])=>({t,f:()=>{
   if(v===1){S.rep+=5;c.signed=true;addTime(15);const l='Ừ, vậy được. Đưa cây viết đây.';
    modal({tag:'Biên bản làm việc',title:'Đã ký',stamp:'ĐÃ KÝ',voice:[l,hoVoice(c.name)],html:`<p>“${l}”</p><p class="muted">+5 uy tín. Mang biên bản về Ban QLDA lập phiếu trình.</p>`,buttons:[{t:'Về Ban nộp'}]});}
   else if(v===0){c.signed=true;addTime(15);toast('“Ừ thôi ký đại…” Ký rồi mà mặt không vui.');say('Ừ thôi ký đại.',hoVoice(c.name));}
   else{S.rep-=10;S.pat-=10;S.scolded++;SFX.bad();const l='Cán bộ gì nói chuyện vậy? Tui không ký! Tui gửi đơn lên trên!';
    modal({tag:'Căng rồi',title:'Hộ dân không ký',voice:[l,hoVoice(c.name)],html:`<p>“${l}”</p><p class="muted">−10 uy tín, −10 kiên nhẫn.</p>`,buttons:[{t:'Xin lỗi, nói lại',f:persuade}]});}
  }}))});
}
function measureGame(done){
 let zw=15*S.role.zone*(S.coffee>3?.6:1),center=rnd(25,75),pos=0,dir=1,hits=0,run=true,last=performance.now();
 const sides=[],names=['Chiều ngang','Chiều dài','Chiều cao nhà'];
 modal({tag:'Kiểm đếm',title:'Đo hiện trạng',html:`<div class="meter"><div class="zone" id="mz"></div><div class="needle" id="mn"></div></div><p id="mm"><b>${names[0]}</b>: —</p>`});
 const btn=document.createElement('button');btn.className='big';btn.textContent='CHỐT';$('#mbtns').appendChild(btn);
 const mz=$('#mz'),mn=$('#mn'),mm=$('#mm');
 const place=()=>{mz.style.left=(center-zw/2)+'%';mz.style.width=zw+'%';};place();
 const loop=t=>{if(!run)return;const dt=Math.min(.05,(t-last)/1000);last=t;pos+=dir*(85+hits*30)*dt;if(pos>100){pos=100;dir=-1}if(pos<0){pos=0;dir=1}mn.style.left=pos+'%';requestAnimationFrame(loop);};
 requestAnimationFrame(loop);
 const hit=e=>{if(e)e.preventDefault();if(!run)return;
  if(Math.abs(pos-center)<=zw/2){
   const s=hits===2?+rnd(3.2,9.5).toFixed(2):+rnd(4,14).toFixed(2);sides.push(s);hits++;SFX.pop();
   mm.innerHTML=sides.map((v,i)=>`<b>${names[i]}</b>: ${v} m ✓`).join('<br>')+(hits<3?`<br><b>${names[hits]}</b>: —`:'');
   center=rnd(20,80);zw=Math.max(6,zw*.85);place();
   if(hits>=3){run=false;btn.disabled=true;document.removeEventListener('keydown',kh);const area=Math.round(sides[0]*sides[1]*10)/10;setTimeout(()=>{closeModal();done(area);},650);}
  }else{S.pat-=4;addTime(2);shakePaper();buzz(60);SFX.bad();
   mm.innerHTML=sides.map((v,i)=>`<b>${names[i]}</b>: ${v} m ✓`).join('<br>')+(sides.length?'<br>':'')+`<b>${names[hits]}</b>: trật! Đo lại (−4 kiên nhẫn)`;}
 };
 const kh=e=>{if(e.code==='Space'||e.code==='Enter'){hit(e);}};
 btn.addEventListener('pointerdown',hit);document.addEventListener('keydown',kh);
}
function citizenClash(){
 S.citizen=null;let v=35,tl=5,run=true,last=performance.now();
 const line=pick(CITIZEN_LINES);
 modal({tag:'Khiếu nại tại chỗ',title:'Chú Lộc chặn đường!',voice:[line,'loc'],html:`<p>“${line}”</p><div class="mash"><div id="mfill"></div></div><p class="muted" id="mt">Bấm liên tục để giải thích chính sách! 5.0 giây</p>`});
 const btn=document.createElement('button');btn.className='big';btn.textContent='🗣 GIẢI THÍCH';$('#mbtns').appendChild(btn);
 const tap=e=>{if(e)e.preventDefault();v+=9;};
 const kh=e=>{if(e.code==='Space'||e.code==='Enter')tap(e);};
 btn.addEventListener('pointerdown',tap);document.addEventListener('keydown',kh);
 const fill=$('#mfill'),mt=$('#mt');
 const finish=()=>{run=false;document.removeEventListener('keydown',kh);closeModal();};
 const loop=t=>{if(!run)return;const dt=Math.min(.05,(t-last)/1000);last=t;v-=20*dt;tl-=dt;fill.style.width=clamp(v,0,100)+'%';mt.textContent=`Bấm liên tục để giải thích chính sách! ${Math.max(0,tl).toFixed(1)} giây`;
  if(v>=100){finish();S.rep+=5;SFX.ok();toast('Chú Lộc: “Ờ… vậy để tui về đọc lại.” +5 uy tín');say('Ờ, vậy để tui về đọc lại.','loc');return;}
  if(tl<=0||v<=0){finish();S.pat-=22;S.scolded++;buzz(200);SFX.bad();toast('Bị chửi một tràng: “#@$%&!” −22 kiên nhẫn');return;}
  requestAnimationFrame(loop);};
 requestAnimationFrame(loop);
}
function phoneCall(){
 const c=S.cur;buzz([80,60,80]);SFX.ring();
 if(!c){const v='Em đâu rồi? Lên Ban nhận hồ sơ đi chứ!';return modal({tag:'📞 Cuộc gọi đến',title:'Sếp',voice:[v,'sep'],html:`<p>“${v}”</p>`,buttons:[{t:'Dạ em lên liền'}]});}
 const v=`${c.name} tới đâu rồi em? Chiều họp giao ban đó!`;
 modal({tag:'📞 Cuộc gọi đến',title:'Sếp',voice:[v,'sep'],html:`<p>“${esc(v)}”</p>`,buttons:[
  {t:'Dạ em đang làm, xong em báo anh liền.',f:()=>{S.rep+=3;toast('Sếp: “Ừ, nhanh nha.” +3 uy tín');say('Ừ, nhanh nha.','sep');}},
  {t:'Dạ xong hết rồi anh!',f:()=>{if(c.signed){S.rep+=5;toast('Sếp: “Giỏi! Mang lên đây.” +5 uy tín');say('Giỏi! Mang lên đây.','sep');}else{c.lied=true;toast('Sếp: “Ừ, chút đem lên anh coi.” (…chết rồi)');say('Ừ, chút đem lên anh coi.','sep');}}},
  {t:'A lô… a lô… em mất sóng anh ơi…',f:()=>{S.nextCall=22;toast('Tút… tút… Sếp sẽ gọi lại.');}},
 ]});
}
function dash(){
 if(!S||S.phase!=='play'||P.dashCd>0)return;
 P.dash=.3;P.dashCd=1.4;P.inv=.5;
 let dodged=false;
 for(const d of DOGS)if(d.state==='chase'&&dist(d.x,d.y,P.x,P.y)<90){d.state='return';d.cd=3.5;dodged=true;}
 if(S.citizen&&dist(S.citizen.x,S.citizen.y,P.x,P.y)<90){S.citizen.stun=1.6;toast('Lách qua! Chú Lộc mất dấu.');return;}
 if(dodged){toast(pick(DODGE_LINES));}
}
function target(){
 const c=S.cur,door=id=>{const b=BLD.find(x=>x.id===id);return{x:b.door[0],y:b.door[1]};};
 if(!c||c.signed)return door('office');
 if(!c.measured)return door(c.hh);
 if(!c.gotA)return{x:NPCS[c.a].x,y:NPCS[c.a].y};
 if(!c.gotB)return door('ubnd');
 return door(c.hh);
}

/* =================== DI CHUYỂN / AI =================== */
function solidAt(x,y,r){
 if(x<r||y<r||x>1004-r||y>WH-r)return true;
 for(const b of BLD)if(x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)return true;
 return false;
}
function moveEnt(e,dx,dy,r){if(!solidAt(e.x+dx,e.y,r))e.x+=dx;if(!solidAt(e.x,e.y+dy,r))e.y+=dy;}
function update(dt){
 if(!S||S.phase!=='play')return;
 advance(dt/REAL_PER_MIN);
 if(S.energy<=0){S.fainted=true;return endDay();}
 if(S.t>=1020)return endDay();
 const ft=(S.t>=630&&S.t<720)||(S.t>=930&&S.t<1000)?1:0;
 S.flood+=(ft-S.flood)*Math.min(1,dt*.35);

 let ix=0,iy=0;
 if(keys.ArrowLeft||keys.KeyA)ix-=1;if(keys.ArrowRight||keys.KeyD)ix+=1;
 if(keys.ArrowUp||keys.KeyW)iy-=1;if(keys.ArrowDown||keys.KeyS)iy+=1;
 if(joy.active){ix+=joy.dx/48;iy+=joy.dy/48;}
 let len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len;len=1;}
 const water=inWater(P.x,P.y);
 let sp=175*S.role.speed*(water?.55:1)*(S.energy<20?.7:1);
 P.dashCd-=dt;P.inv-=dt;
 if(P.dash>0){P.dash-=dt;sp*=2.6;if(len<.15){ix=P.fx;iy=P.fy;len=1;}}
 if(len>.15){const n=Math.hypot(ix,iy);P.fx=ix/n;P.fy=iy/n;moveEnt(P,ix*sp*dt,iy*sp*dt,10);P.moving=true;}else P.moving=false;

 for(const d of DOGS){
  d.t+=dt;d.cd-=dt;const dd=dist(d.x,d.y,P.x,P.y);
  if(d.state==='idle'){
   const tx=d.hx+Math.cos(d.t*.7)*18,ty=d.hy+Math.sin(d.t*.9)*10,ox=d.x,oy=d.y;moveEnt(d,(tx-d.x)*dt*2,(ty-d.y)*dt*2,7);d.fx=d.x-ox;d.fy=d.y-oy;
   if(dd<150&&d.cd<=0){d.state='chase';d.ct=0;SFX.bark();toast('🐕 GÂU GÂU! Chó nhà dân xổng ra! Bấm NÉ!');}
  }else if(d.state==='chase'){
   d.ct+=dt;const a=Math.atan2(P.y-d.y,P.x-d.x);d.fx=Math.cos(a);d.fy=Math.sin(a);moveEnt(d,d.fx*158*dt,d.fy*158*dt,7);
   if(Math.random()<dt*1.2)SFX.bark();
   if(dist(d.x,d.y,d.hx,d.hy)>330||d.ct>6.5){d.state='return';d.cd=3;}
   if(dd<20&&P.inv<=0){S.energy-=10;S.pat-=6;S.bitten++;P.inv=1.2;d.state='return';d.cd=5;buzz(150);SFX.bark();
    moveEnt(P,Math.cos(a)*26,Math.sin(a)*26,10);
    toast('Bị chó táp ống quần! −10 năng lượng, −6 kiên nhẫn');}
  }else{
   const a=Math.atan2(d.hy-d.y,d.hx-d.x);d.fx=Math.cos(a);d.fy=Math.sin(a);moveEnt(d,d.fx*95*dt,d.fy*95*dt,7);
   if(dist(d.x,d.y,d.hx,d.hy)<10)d.state='idle';
  }
 }

 S.nextCit-=dt;
 if(!S.citizen&&S.nextCit<=0&&!isLunch()&&S.t<1000){
  const pts=ROAD_PTS.filter(([x,y])=>dist(x,y,P.x,P.y)>300);const [x,y]=pick(pts.length?pts:ROAD_PTS);
  S.citizen={x,y,life:22,stun:0,fx:0,fy:1};S.nextCit=rnd(65,105);toast('⚠️ Chú Lộc mang đơn khiếu nại đang tìm bạn!');
 }
 const ci=S.citizen;
 if(ci){
  ci.life-=dt;ci.stun-=dt;
  if(ci.stun<=0){const a=Math.atan2(P.y-ci.y,P.x-ci.x);ci.fx=Math.cos(a);ci.fy=Math.sin(a);moveEnt(ci,ci.fx*112*dt,ci.fy*112*dt,9);}
  if(ci.life<=0){S.citizen=null;toast('Chú Lộc mỏi chân, bỏ về.');}
  else if(dist(ci.x,ci.y,P.x,P.y)<22&&P.inv<=0&&ci.stun<=0)return citizenClash();
 }

 S.nextCall-=dt;
 if(S.nextCall<=0){S.nextCall=rnd(100,160);return phoneCall();}

 if(S.pat<=0){S.pat=40;S.rep-=20;S.scolded++;
  return modal({tag:'Sự cố',title:'Bùng nổ!',stamp:'KỶ LUẬT',html:'<p>Bạn hết kiên nhẫn, cãi tay đôi với dân giữa xóm. Có người quay clip đăng mạng.</p><p class="muted">−20 uy tín. Kiên nhẫn hồi về 40.</p>',buttons:[{t:'Hít thở sâu, làm tiếp'}]});}

 let best=null,bd=64;
 for(const it of ITEMS){const d=dist(it.x,it.y,P.x,P.y);if(d<bd){bd=d;best=it;}}
 S.near=best;
}

/* =================== 3D =================== */
const cv=$('#cv'),ov=$('#ov'),octx=ov.getContext('2d');
let cw=360,ch=640,odpr=1;
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!isTouch,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(isTouch?1.5:2,window.devicePixelRatio||1));
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xbfdcef);
scene.fog=new THREE.Fog(0xbfdcef,55,120);
const camera=new THREE.PerspectiveCamera(50,1,.5,300);
camera.position.set(35,25,45);
scene.add(new THREE.HemisphereLight(0xffffff,0x5d7d45,.8));
const sun=new THREE.DirectionalLight(0xfff4e0,.7);sun.position.set(-40,80,30);scene.add(sun);
function resize(){const r=$('#app').getBoundingClientRect();cw=r.width;ch=r.height;renderer.setSize(cw,ch,false);camera.aspect=cw/ch;camera.updateProjectionMatrix();odpr=Math.min(2,window.devicePixelRatio||1);ov.width=Math.round(cw*odpr);ov.height=Math.round(ch*odpr);}
addEventListener('resize',resize);resize();

const MATS={};
const M=c=>MATS[c]||(MATS[c]=new THREE.MeshLambertMaterial({color:c}));
const GBOX=new THREE.BoxGeometry(1,1,1);
function box(w,h,d,c,x,y,z){const m=new THREE.Mesh(GBOX,typeof c==='string'?M(c):c);m.scale.set(w,h,d);m.position.set(x,y,z);return m;}
const GSPH=new THREE.SphereGeometry(1,14,10);
const GPYR=new THREE.CylinderGeometry(0,1,1,4,1);GPYR.rotateY(Math.PI/4);
const GSHADOW=new THREE.CircleGeometry(1,16);GSHADOW.rotateX(-Math.PI/2);
const MSHADOW=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false});
const W3=(x,y)=>[x*SC,y*SC];

function textSprite(text,o={}){
 const size=64,bg=o.bg||'rgba(20,32,25,.88)',fg=o.fg||'#fff',h=o.h||1.1;
 const c=document.createElement('canvas'),g=c.getContext('2d');
 g.font=`900 ${size}px ${FONT}`;const w=Math.ceil(g.measureText(text).width)+size*.7;
 c.width=w;c.height=Math.round(size*1.45);
 g.font=`900 ${size}px ${FONT}`;g.fillStyle=bg;const r=14;
 g.beginPath();g.moveTo(r,0);g.arcTo(w,0,w,c.height,r);g.arcTo(w,c.height,0,c.height,r);g.arcTo(0,c.height,0,0,r);g.arcTo(0,0,w,0,r);g.closePath();g.fill();
 if(o.border){g.strokeStyle=o.border;g.lineWidth=6;g.stroke();}
 g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,c.height/2+3);
 const tex=new THREE.CanvasTexture(c);tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:o.depth!==false,transparent:true}));
 sp.scale.set(h*w/c.height,h,1);sp.renderOrder=o.depth===false?20:5;return sp;
}
function facadeTex(col,w,h){
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 g.fillStyle=col;g.fillRect(0,0,64,64);
 g.fillStyle='rgba(30,45,40,.55)';g.fillRect(20,16,24,26);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(22,18,9,10);
 g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,60,64,4);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(Math.max(1,Math.round(w/3.4)),Math.max(1,Math.round(h/2.6)));return t;
}
function pitchTex(){
 const c=document.createElement('canvas');c.width=256;c.height=192;const g=c.getContext('2d');
 for(let i=0;i<8;i++){g.fillStyle=i%2?'#7fb257':'#8cbf62';g.fillRect(i*32,0,32,192);}
 g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(8,8,240,176);g.beginPath();g.moveTo(128,8);g.lineTo(128,184);g.stroke();g.beginPath();g.arc(128,96,26,0,7);g.stroke();
 return new THREE.CanvasTexture(c);
}
function flat(w,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);return m;}

let waterMat,floodA,floodB,targetCone,targetRing,nearRing;
const dogMeshes=[],npcMeshes={};
let playerMesh,citizenMesh;
function buildWorld(){
 scene.add(flat(320,320,M('#9fc06c'),55,-.1,75));
 scene.add(flat(103,WH*SC+4,M('#a6c773'),49.5,0,WH*SC/2));
 const pitch=flat(27,20,new THREE.MeshLambertMaterial({map:pitchTex()}),75,.02,134);scene.add(pitch);
 const road=M('#6f6d67');
 RH.forEach(([a,b])=>scene.add(flat(101,(b-a)*SC,road,50.5,.03,(a+b)/2*SC)));
 RV.forEach(([a,b])=>scene.add(flat((b-a)*SC,WH*SC,road,(a+b)/2*SC,.035,WH*SC/2)));
 const dashes=[];
 RH.forEach(([a,b])=>{for(let x=1;x<100;x+=2.6)if(!RV.some(([p,q])=>x*10>p-10&&x*10<q+10))dashes.push([x,(a+b)/2*SC,0]);});
 RV.forEach(([a,b])=>{for(let z=1;z<150;z+=2.6)if(!RH.some(([p,q])=>z*10>p-10&&z*10<q+10))dashes.push([(a+b)/2*SC,z,1]);});
 const dg=new THREE.PlaneGeometry(1.4,.2);dg.rotateX(-Math.PI/2);
 const im=new THREE.InstancedMesh(dg,new THREE.MeshBasicMaterial({color:0xeeeeee}),dashes.length),dm=new THREE.Object3D();
 dashes.forEach(([x,z,r],i)=>{dm.position.set(x,.05,z);dm.rotation.set(0,r?Math.PI/2:0,0);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);});scene.add(im);
 waterMat=new THREE.MeshLambertMaterial({color:0x4f8fb8,emissive:0x0b2a40});
 scene.add(flat(60,320,waterMat,131,-.04,75));
 scene.add(box(.6,.5,WH*SC,'#8d7a5a',101,.2,WH*SC/2));
 const fm=new THREE.MeshLambertMaterial({color:0x4a87b5,transparent:true,opacity:.6,emissive:0x0b2a40,depthWrite:false});
 floodA=flat(1,1,fm,0,.12,0);floodB=flat(1,1,fm,0,.12,0);scene.add(floodA,floodB);
 const trunk=new THREE.CylinderGeometry(.25,.35,1.6,6),leaf=new THREE.IcosahedronGeometry(1.7,0);
 for(const [x,y] of TREES){const t=new THREE.Mesh(trunk,M('#6b4a2e'));t.position.set(x*SC,.8,y*SC);scene.add(t);
  const l=new THREE.Mesh(leaf,M(Math.random()<.5?'#4f8a3a':'#5e9c45'));l.position.set(x*SC,2.6,y*SC);l.rotation.set(Math.random(),Math.random(),0);scene.add(l);
  const s=new THREE.Mesh(GSHADOW,MSHADOW);s.scale.setScalar(1.6);s.position.set(x*SC,.06,y*SC);scene.add(s);}
 for(const b of BLD)buildB(b);
 for(const k in NPCS){const n=NPCS[k];const m=makePerson({shirt:n.shirt,hat:n.hat,hatCol:n.hatCol,tag:n.short});m.position.set(n.x*SC,0,n.y*SC);m.rotation.y=0;scene.add(m);npcMeshes[k]=m;
  const alert=textSprite('!',{bg:'#c8102e',h:1.3});alert.position.y=5;alert.visible=false;m.add(alert);m.userData.alert=alert;}
 for(let i=0;i<3;i++){const d=makeDog();scene.add(d);dogMeshes.push(d);}
 playerMesh=makePerson({shirt:'#1f5fa8',hat:'helmet',hatCol:'#f2c230',vest:1,clip:1});scene.add(playerMesh);
 citizenMesh=makePerson({shirt:'#a8322a',hat:'cap',hatCol:'#d9d0b0',clip:1,tag:'Chú Lộc 📄',tagBg:'#c8102e'});citizenMesh.visible=false;scene.add(citizenMesh);
 targetCone=new THREE.Mesh(new THREE.ConeGeometry(.7,1.4,4),new THREE.MeshLambertMaterial({color:0xf2c230,emissive:0x5a4300}));targetCone.rotation.x=Math.PI;scene.add(targetCone);
 const rg=new THREE.RingGeometry(1.8,2.3,32);rg.rotateX(-Math.PI/2);
 targetRing=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:0xf2c230,transparent:true,opacity:.8,depthWrite:false}));scene.add(targetRing);
 const ng=new THREE.RingGeometry(1.4,1.6,32);ng.rotateX(-Math.PI/2);
 nearRing=new THREE.Mesh(ng,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false}));scene.add(nearRing);
}
function buildB(b){
 const w=b.w*SC,d=b.h*SC,cx=(b.x+b.w/2)*SC,cz=(b.y+b.h/2)*SC;
 const big=b.id==='office'||b.id==='ubnd';
 const H=big?6.5:b.house?3.2+((b.num*7)%5)*.45:b.id==='mieu'?2.4:3.4;
 const g=new THREE.Group();g.position.set(cx,0,cz);
 const side=new THREE.MeshLambertMaterial({map:facadeTex(b.col,w,H)});
 const body=new THREE.Mesh(GBOX,[side,side,M(b.roof),side,side,side]);body.scale.set(w,H,d);body.position.y=H/2;g.add(body);
 if(big){
  g.add(box(w+.4,.6,d+.4,b.roof,0,H+.3,0));
  g.add(box(w*.5,1.6,.3,b.roof,0,H+1.4,d/2));
  g.add(box(.12,5,.12,'#dddddd',-w/2+1.2,H+2.5,d/2-1.2));
  g.add(box(1.8,1.1,.05,'#c8102e',-w/2+2.1,H+4.4,d/2-1.2));
  for(let i=0;i<5;i++)g.add(box(.5,.9,.5,'#efe6cf',-w/2+3+i*(w-6)/4,H*.45,d/2+.3));
 }else{
  const r=new THREE.Mesh(GPYR,M(b.roof));r.scale.set(w/Math.SQRT2*1.1,1.7,d/Math.SQRT2*1.1);r.position.y=H+.85;g.add(r);
 }
 if(b.door){
  const dc='#4a3020';
  if(b.id==='cafe'||b.id==='banhmi'){g.add(box(.2,2.2,1.8,dc,w/2+.05,1.1,0));g.add(box(.8,.12,2.6,b.roof,w/2+.45,2.6,0));}
  else{const front=b.door[1]<b.y?-1:1;g.add(box(1.7,2.3,.2,dc,b.door[0]*SC-cx,1.15,front*(d/2+.05)));g.add(box(2.6,.12,.9,b.roof,b.door[0]*SC-cx,2.7,front*(d/2+.4)));}
 }
 const sign=textSprite(b.label,{bg:b.house?'rgba(20,32,25,.8)':'#1f5c46',h:b.house?1:1.4});sign.position.y=H+(big?3.2:2.6);g.add(sign);
 b.H=H;b.g=g;scene.add(g);
}
function updateSigns(){
 const key=S&&S.cur?S.cur.hh+S.cur.name:'';if(key===(S&&S.signKey))return;if(S)S.signKey=key;
 for(const b of BLD){if(!b.house)continue;
  if(b.caseSign){b.g.remove(b.caseSign);b.caseSign=null;}
  if(S&&S.cur&&S.cur.hh===b.id){b.caseSign=textSprite(S.cur.name,{bg:'#c8102e',h:1.2,border:'#fff'});b.caseSign.position.y=b.H+4;b.g.add(b.caseSign);}
 }
}
function limb(w,h,d,c,x,y){const g=new THREE.Group();const m=new THREE.Mesh(GBOX,M(c));m.scale.set(w,h,d);m.position.y=-h/2;g.add(m);g.position.set(x,y,0);return g;}
function makePerson(o){
 const g=new THREE.Group();
 const sh=new THREE.Mesh(GSHADOW,MSHADOW);sh.scale.setScalar(.9);sh.position.y=.05;g.add(sh);
 const legL=limb(.38,1.05,.38,'#2b2b2b',-.24,1.05),legR=limb(.38,1.05,.38,'#2b2b2b',.24,1.05);g.add(legL,legR);
 g.add(box(1.1,1.25,.7,o.shirt,0,1.65,0));
 if(o.vest){g.add(box(1.13,.18,.73,'#f2c230',0,1.55,0));g.add(box(1.13,.18,.73,'#f2c230',0,1.9,0));}
 const armL=limb(.3,1.05,.3,o.shirt,-.72,2.2),armR=limb(.3,1.05,.3,o.shirt,.72,2.2);g.add(armL,armR);
 const head=new THREE.Mesh(GSPH,M('#e9b98f'));head.scale.setScalar(.5);head.position.y=2.75;g.add(head);
 const eye=M('#142019');const e1=new THREE.Mesh(GSPH,eye);e1.scale.setScalar(.07);e1.position.set(-.17,2.8,.45);const e2=e1.clone();e2.position.x=.17;g.add(e1,e2);
 if(o.hat==='helmet'){const h=new THREE.Mesh(new THREE.SphereGeometry(.56,14,8,0,Math.PI*2,0,Math.PI/2),M(o.hatCol));h.position.y=2.85;g.add(h);g.add(box(1.2,.08,1.2,o.hatCol,0,2.88,.1));}
 else if(o.hat==='nonla'){const h=new THREE.Mesh(new THREE.ConeGeometry(.95,.6,16),M(o.hatCol));h.position.y=3.35;g.add(h);}
 else if(o.hat==='cap'){const h=new THREE.Mesh(new THREE.SphereGeometry(.53,14,8,0,Math.PI*2,0,Math.PI/2),M(o.hatCol));h.position.y=2.9;g.add(h);g.add(box(.6,.08,.5,o.hatCol,0,2.92,.55));}
 if(o.clip){g.add(box(.55,.72,.07,'#f7f7f2',.55,1.6,.45));g.add(box(.25,.1,.08,'#1f5c46',.55,1.98,.46));}
 if(o.tag){const t=textSprite(o.tag,{bg:o.tagBg,h:.9});t.position.y=4.1;g.add(t);g.userData.tag=t;}
 g.userData.limbs=[legL,legR,armL,armR];
 return g;
}
function animPerson(g,moving,t){const s=moving?Math.sin(t*12)*.7:0,[a,b,c,d]=g.userData.limbs;a.rotation.x=s;b.rotation.x=-s;c.rotation.x=-s*.8;d.rotation.x=s*.8;}
function makeDog(){
 const g=new THREE.Group(),fur='#c98a3c',dark='#5a3a1a';
 const sh=new THREE.Mesh(GSHADOW,MSHADOW);sh.scale.set(.9,1,1.3);sh.position.y=.05;g.add(sh);
 g.add(box(.7,.65,1.5,fur,0,.85,0));
 const head=new THREE.Group();head.position.set(0,1.35,.85);head.add(box(.6,.55,.6,fur,0,0,0));head.add(box(.34,.26,.35,'#e2b27a',0,-.08,.4));head.add(box(.12,.1,.08,'#142019',0,0,.6));
 head.add(box(.16,.3,.1,dark,-.22,.35,-.05));head.add(box(.16,.3,.1,dark,.22,.35,-.05));g.add(head);
 const legs=[[-.22,.5],[.22,.5],[-.22,-.5],[.22,-.5]].map(([x,z])=>{const l=limb(.2,.6,.2,fur,x,.6);l.position.z=z;g.add(l);return l;});
 const tail=new THREE.Group();tail.position.set(0,1.1,-.75);tail.add(box(.12,.12,.55,dark,0,.1,-.25));tail.rotation.x=.6;g.add(tail);
 const bark=textSprite('GÂU!',{bg:'#c8102e',h:.9});bark.position.y=2.6;bark.visible=false;g.add(bark);
 g.userData={legs,tail,bark,head};return g;
}

/* =================== VẼ KHUNG HÌNH =================== */
const camTarget=new THREE.Vector3(),camPos=new THREE.Vector3(),tmpV=new THREE.Vector3();
let camReady=false;
function sync(t,dt){
 if(!S)return;
 playerMesh.position.set(P.x*SC,0,P.y*SC);playerMesh.rotation.y=Math.atan2(P.fx,P.fy);animPerson(playerMesh,P.moving,t*(P.dash>0?1.8:1));
 playerMesh.visible=!(P.inv>0&&Math.floor(t*20)%2);
 for(const d of DOGS){const m=d.m;m.position.set(d.x*SC,0,d.y*SC);if(d.fx||d.fy)m.rotation.y=Math.atan2(d.fx,d.fy);
  const run=d.state==='chase',u=m.userData;u.legs.forEach((l,i)=>l.rotation.x=(run||d.state==='return')?Math.sin(t*18+i*Math.PI)*.8:0);
  u.tail.rotation.y=Math.sin(t*(run?25:9))*.6;u.bark.visible=run&&Math.sin(t*10)>-.3;}
 const ci=S.citizen;citizenMesh.visible=!!ci;
 if(ci){citizenMesh.position.set(ci.x*SC,0,ci.y*SC);citizenMesh.rotation.y=Math.atan2(ci.fx,ci.fy);animPerson(citizenMesh,ci.stun<=0,t);}
 for(const k in NPCS){const m=npcMeshes[k];m.userData.alert.visible=!!(S.cur&&S.cur.a===k&&!S.cur.gotA);m.userData.alert.position.y=5+Math.sin(t*4)*.2;
  const dx=P.x-NPCS[k].x,dy=P.y-NPCS[k].y;if(dx*dx+dy*dy<200*200)m.rotation.y=Math.atan2(dx,dy);}
 const wx=1010-S.flood*170,wy=WH-S.flood*290;
 floodA.visible=floodB.visible=S.flood>.01;
 if(floodA.visible){floodA.scale.set((1010-wx)*SC,WH*SC,1);floodA.position.set((wx+1010)/2*SC,.12+Math.sin(t*1.5)*.03,WH*SC/2);
  floodB.scale.set(wx*SC,(WH-wy)*SC+.01,1);floodB.position.set(wx/2*SC,.12,(wy+WH)/2*SC);}
 waterMat.emissive.setHSL(.57,.6,.1+Math.sin(t*1.3)*.02);
 const tg=target();targetCone.position.set(tg.x*SC,5.2+Math.sin(t*4)*.4,tg.y*SC);targetCone.rotation.y=t*2;
 targetRing.position.set(tg.x*SC,.08,tg.y*SC);const pul=1+Math.sin(t*5)*.12;targetRing.scale.set(pul,1,pul);
 nearRing.visible=!!S.near&&S.phase==='play';if(S.near)nearRing.position.set(S.near.x*SC,.09,S.near.y*SC);
 syncOthers(t,dt);
 const port=cw/ch<.8,k=port?1.3:1;
 camTarget.set(P.x*SC,0,P.y*SC-(port?4.5:3));
 camPos.set(P.x*SC,21*k,P.y*SC+15*k);
 if(!camReady){camera.position.copy(camPos);camReady=true;}else camera.position.lerp(camPos,Math.min(1,dt*5));
 camera.lookAt(camTarget);
}
function project(x,y,h){tmpV.set(x*SC,h||1,y*SC).project(camera);return{x:(tmpV.x+1)/2*cw,y:(1-tmpV.y)/2*ch,behind:tmpV.z>1};}
function overlay(t){
 octx.setTransform(odpr,0,0,odpr,0,0);octx.clearRect(0,0,cw,ch);
 if(!S||S.phase==='end')return;
 const tg=target(),p=project(tg.x,tg.y,4);
 const hudB=($('#task').getBoundingClientRect().bottom-$('#app').getBoundingClientRect().top)+50,top=hudB,bot=ch-110,m=30;
 if(p.behind||p.x<m||p.x>cw-m||p.y<top||p.y>bot){
  const cx=cw/2,cy=(top+bot)/2;let dx=p.x-cx,dy=p.y-cy;if(p.behind){dx=-dx;dy=-dy;}
  const a=Math.atan2(dy,dx),ux=Math.cos(a),uy=Math.sin(a);let k=Infinity;
  if(ux>0)k=Math.min(k,(cw-m-cx)/ux);if(ux<0)k=Math.min(k,(m-cx)/ux);if(uy>0)k=Math.min(k,(bot-cy)/uy);if(uy<0)k=Math.min(k,(top-cy)/uy);
  const px=cx+ux*k,py=cy+uy*k;
  octx.save();octx.translate(px,py);octx.rotate(a);octx.fillStyle='#f2c230';octx.strokeStyle='#142019';octx.lineWidth=2.5;
  octx.beginPath();octx.moveTo(18,0);octx.lineTo(-10,-13);octx.lineTo(-4,0);octx.lineTo(-10,13);octx.closePath();octx.fill();octx.stroke();octx.restore();
  octx.font=`900 12px ${FONT}`;octx.textAlign='center';octx.lineWidth=3;octx.strokeStyle='#fff';const txt=Math.round(dist(tg.x,tg.y,P.x,P.y)/8)+' m';
  octx.strokeText(txt,px-ux*30,py-uy*30+4);octx.fillStyle='#142019';octx.fillText(txt,px-ux*30,py-uy*30+4);
 }
 if(joy.active){octx.strokeStyle='rgba(255,255,255,.85)';octx.lineWidth=3;octx.fillStyle='rgba(20,32,25,.2)';octx.beginPath();octx.arc(joy.bx,joy.by,48,0,7);octx.fill();octx.stroke();
  octx.fillStyle='rgba(255,255,255,.9)';octx.beginPath();octx.arc(joy.bx+joy.dx,joy.by+joy.dy,20,0,7);octx.fill();}
}

/* =================== HUD =================== */
let hudT=0;
function setBar(id,boxId,v){$(id).style.width=clamp(v*100,0,100)+'%';$(boxId).classList.toggle('low',v<.25);}
function hud(){
 $('#clock').textContent=fmt(S.t);
 $('#status').textContent=isLunch()?'Nghỉ trưa':S.flood>.5?'Triều cường':S.t<690?'Ca sáng':'Ca chiều';
 setBar('#be','#b1',S.energy/100);setBar('#bf','#b2',S.food/100);setBar('#bp','#b3',S.pat/S.patMax);
 $('#done').textContent=S.done;$('#rep').textContent=Math.round(S.rep);
 const c=S.cur;let key,html;
 if(!c){key='none';html='<b>📁 Chưa có hồ sơ</b><div class="chips"><i class="next">Lên Ban QLDA nhận việc</i></div>';}
 else{
  const steps=[[c.measured,'Kiểm đếm'],[c.gotA,NPCS[c.a].short],[c.gotB,'Lưu trữ'],[c.signed,'Ký biên bản'],[false,'Nộp']];
  const nx=steps.findIndex(s=>!s[0]);key=c.name+steps.map(s=>s[0]?1:0).join('');
  html=`<b>📁 ${esc(c.name)} · số ${c.num}</b><span class="kind">${KIND_NAME[c.kind]}</span><div class="chips">${steps.map((s,i)=>`<i class="${s[0]?'ok':i===nx?'next':''}">${s[0]?'✓':'○'} ${s[1]}</i>`).join('')}</div>`;
 }
 if(key!==S.taskKey){S.taskKey=key;$('#task').innerHTML=html;}
 const ba=$('#bAct');
 if(S.near&&S.phase==='play'){ba.disabled=false;ba.textContent=actLabel(S.near);ba.classList.add('live');}else{ba.disabled=true;ba.textContent='Đi tới chỗ cần làm';ba.classList.remove('live');}
 const bd=$('#bDash');bd.classList.toggle('cd',P.dashCd>0);
 bd.classList.toggle('alert',DOGS.some(d=>d.state==='chase')||!!(S.citizen&&dist(S.citizen.x,S.citizen.y,P.x,P.y)<160));
}

/* =================== KẾT THÚC NGÀY =================== */
const PKEY='tbt_profile_v1';
function rank(){
 if(S.fainted)return['Ngất tại hiện trường','Đồng nghiệp chở về bằng xe ôm. Mai nhớ ăn sáng, uống cà phê.'];
 if(S.done>=5&&S.rep>=180)return['Chiến thần giải phóng mặt bằng','Sếp đề xuất khen thưởng. Cả xóm nhớ mặt, nhớ tên.'];
 if(S.done>=3)return['Hoàn thành tốt nhiệm vụ','Cuối năm chắc có giấy khen.'];
 if(S.done>=1)return['Hoàn thành nhiệm vụ','Có nhắc nhở nhẹ ở cuộc họp giao ban.'];
 return['Không hoàn thành nhiệm vụ','Tối nay viết bản kiểm điểm, nộp trước 8 giờ sáng mai.'];
}
function endDay(){
 S.phase='end';closeModal();joy.active=false;
 const [t,sub]=rank(),p=store.get(PKEY,{days:0,cases:0,best:0,top:''});
 p.days++;p.cases+=S.done;if(Math.round(S.rep)>p.best){p.best=Math.round(S.rep);p.top=t;}store.set(PKEY,p);
 $('#eTitle').textContent=t;$('#eSub').textContent=sub;
 const row=(a,b)=>`<span>${a}</span><b>${esc(b)}</b>`;
 $('#eStats').innerHTML=row('Vị trí',S.role.name)+row('Kết thúc lúc',fmt(Math.min(S.t,1020)))+row('Hồ sơ được duyệt',S.done)+row('Hồ sơ bị trả về',S.failed)+row('Uy tín cuối ngày',Math.round(S.rep))+row('Bị chó táp',S.bitten+' lần')+row('Bị dân mắng',S.scolded+' lần')+row('Ly cà phê',S.coffee);
 $('#end').hidden=false;netState(true);say(t+'. '+sub,'sep');
}
function showProfile(){
 const p=store.get(PKEY,{days:0});
 $('#prof').innerHTML=p.days?`<b>Hồ sơ cán bộ</b><br>Đã đi làm ${p.days} ngày, ${p.cases} hồ sơ được duyệt.<br>Uy tín cao nhất: ${p.best}${p.top?` (${esc(p.top)})`:''}.`:'<b>Hồ sơ cán bộ</b><br>Ngày đầu đi làm. Chưa có thành tích gì.';
}

/* =================== CHƠI NHIỀU NGƯỜI =================== */
const NET={ws:null,id:null,room:null,online:false,others:new Map(),list:[],lastSend:0,retry:0};
const ONLINE_OK=window.TBT_ONLINE!==false&&/^https?:$/.test(location.protocol);
const urlRoom=(new URLSearchParams(location.search).get('xom')||'').toLowerCase();
function netConnect(){
 if(!ONLINE_OK||NET.ws)return;
 let ws;try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');}catch(e){return netInfo();}
 NET.ws=ws;
 ws.onopen=()=>{NET.retry=0;netHello();};
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}netMsg(m);};
 ws.onclose=()=>{const was=NET.online;NET.ws=null;NET.online=false;clearOthers();netInfo();if(was)chatLine(null,'Mất kết nối. Đang thử lại…',true);
  if(NET.retry<20){NET.retry++;setTimeout(netConnect,Math.min(15000,2000*NET.retry));}};
 ws.onerror=()=>{};
}
function netHello(){if(NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify({t:'hello',name:myName(),role:rolled?rolled.name:'',room:NET.room||urlRoom}));}
function netMsg(m){
 if(m.t==='welcome'){NET.online=true;NET.id=m.id;NET.room=m.room;netInfo();
  try{const u=new URL(location.href);u.searchParams.set('xom',m.room);history.replaceState(null,'',u);}catch(e){}
  if(!NET.welcomed||NET.welcomed!==m.room)chatLine(null,`Vào xóm “${m.room}”, đang có ${m.count} người.`,true);NET.welcomed=m.room;}
 else if(m.t==='snap'){NET.list=m.p;updateOthers(m.p);}
 else if(m.t==='chat'){chatLine(m.name,m.text,false);SFX.pop();const o=m.id===NET.id?{g:playerMesh}:NET.others.get(m.id);if(o)bubble(o.g,m.text);}
 else if(m.t==='sys')chatLine(null,m.text,true);
}
function netState(force){
 if(!NET.online||!S)return;const now=performance.now();if(!force&&now-NET.lastSend<100)return;NET.lastSend=now;
 NET.ws.send(JSON.stringify({t:'st',s:[Math.round(P.x),Math.round(P.y),+P.fx.toFixed(2),+P.fy.toFixed(2),P.moving?1:0,S.done,Math.round(S.rep)]}));
}
const SHIRTS=['#8e44ad','#d35400','#16a085','#2c3e50','#c0392b','#27ae60','#7f8c8d','#e67e22'];
function hashCol(id){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))|0;return SHIRTS[Math.abs(h)%SHIRTS.length];}
function updateOthers(list){
 const seen=new Set();
 for(const [id,name,role,x,y,fx,fy,mv] of list){
  if(id===NET.id)continue;seen.add(id);
  let o=NET.others.get(id);
  if(!o){const g=makePerson({shirt:hashCol(id),hat:'helmet',hatCol:'#f2c230',vest:1,clip:1,tag:name,tagBg:'rgba(31,92,70,.9)'});g.position.set(x*SC,0,y*SC);scene.add(g);o={g,x,y,tx:x,ty:y,fx,fy,mv};NET.others.set(id,o);}
  o.tx=x;o.ty=y;o.fx=fx;o.fy=fy;o.mv=mv;
 }
 for(const [id,o] of NET.others)if(!seen.has(id)){scene.remove(o.g);NET.others.delete(id);}
}
function clearOthers(){for(const [,o] of NET.others)scene.remove(o.g);NET.others.clear();NET.list=[];}
function syncOthers(t,dt){
 for(const [,o] of NET.others){const k=Math.min(1,dt*10);o.x+=(o.tx-o.x)*k;o.y+=(o.ty-o.y)*k;o.g.position.set(o.x*SC,0,o.y*SC);
  if(o.fx||o.fy)o.g.rotation.y=Math.atan2(o.fx,o.fy);animPerson(o.g,!!o.mv,t);
  if(o.g.userData.bubble&&t>o.g.userData.bubbleT){o.g.remove(o.g.userData.bubble);o.g.userData.bubble=null;}}
 const pb=playerMesh.userData;if(pb.bubble&&t>pb.bubbleT){playerMesh.remove(pb.bubble);pb.bubble=null;}
}
function bubble(g,text){const u=g.userData;if(u.bubble)g.remove(u.bubble);const s=textSprite(text.length>28?text.slice(0,27)+'…':text,{bg:'#fff',fg:'#142019',h:.9,border:'#142019'});s.position.y=5.1;g.add(s);u.bubble=s;u.bubbleT=clock.getElapsedTime()+5;}
function netInfo(){
 const el=$('#netInfo');const dot=$('#online');
 if(!ONLINE_OK){el.textContent='Đang chơi một mình (mở bằng file hoặc bản xem trước). Muốn chơi chung: chạy server.js rồi mở địa chỉ máy chủ.';dot.hidden=true;return;}
 if(NET.online){const n=NET.list.length||1;el.textContent=`Đang online ở xóm “${NET.room}”. Bấm 🔗 trong game để rủ bạn.`;dot.hidden=false;dot.textContent=n;}
 else{el.textContent=NET.retry?'Mất kết nối máy chủ. Vẫn chơi một mình được, tự kết nối lại khi có mạng.':`Bấm vào ca là tự vào xóm online${urlRoom?` “${urlRoom}”`:''}. Không có máy chủ thì chơi một mình.`;dot.hidden=true;}
}
function chatLine(name,text,sys){
 const log=$('#chatlog'),d=document.createElement('div');if(sys)d.className='sys';
 if(name){const b=document.createElement('b');b.textContent=name+': ';d.appendChild(b);}
 d.appendChild(document.createTextNode(text));log.appendChild(d);
 while(log.children.length>5)log.firstChild.remove();
 setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),700);},9000);
}
function myName(){return ($('#pname').value||'').trim().slice(0,20)||'Cán bộ';}
function openChat(){
 if(!NET.online)return toast('Chat cần chơi online qua máy chủ.');
 if(S&&S.phase==='play'){for(const k in keys)keys[k]=false;}
 $('#chatbar').hidden=false;$('#chatIn').focus();
}
function sendChat(){const v=$('#chatIn').value.trim();$('#chatIn').value='';$('#chatbar').hidden=true;if(v&&NET.online)NET.ws.send(JSON.stringify({t:'chat',text:v}));}
function showBoard(){
 if(!S)return;
 const rows=NET.online&&NET.list.length?NET.list.map(p=>({id:p[0],name:p[1],role:p[2],done:p[8],rep:p[9]})):[{id:'me',name:myName(),role:S.role.name,done:S.done,rep:Math.round(S.rep)}];
 rows.sort((a,b)=>b.done-a.done||b.rep-a.rep);
 const me=NET.online?NET.id:'me';
 modal({tag:NET.online?`Xóm “${NET.room}” · ${rows.length} người`:'Chơi một mình',title:'Bảng xếp hạng',
  html:`<table class="lb">${rows.map((r,i)=>`<tr class="${r.id===me?'me':''}"><td>${i+1}</td><td><b>${esc(r.name)}</b><br><span class="muted">${esc(r.role)}</span></td><td>${r.done} hồ sơ</td><td>${r.rep}</td></tr>`).join('')}</table>`,
  buttons:[{t:'Đóng'}]});
}
function invite(){
 if(!NET.online)return toast('Rủ bạn cần chơi online qua máy chủ.');
 const u=new URL(location.href);u.searchParams.set('xom',NET.room);const link=u.toString();
 const done=()=>toast('Đã chép link rủ bạn vào xóm!');
 if(navigator.share&&isTouch){navigator.share({title:'Một ngày làm tổ bồi thường',text:'Vô xóm làm GPMB chung nè!',url:link}).catch(()=>{});return;}
 if(navigator.clipboard)navigator.clipboard.writeText(link).then(done,()=>modal({tag:'Rủ bạn',title:'Link vào xóm',html:`<p style="word-break:break-all">${esc(link)}</p>`,buttons:[{t:'Đóng'}]}));
 else modal({tag:'Rủ bạn',title:'Link vào xóm',html:`<p style="word-break:break-all">${esc(link)}</p>`,buttons:[{t:'Đóng'}]});
}

/* =================== MÀN HÌNH ĐẦU =================== */
let rolled=null;
function weightedRole(){const tot=ROLES.reduce((s,r)=>s+r.w,0);let x=Math.random()*tot;for(const r of ROLES){x-=r.w;if(x<=0)return r;}return ROLES[0];}
$('#pname').value=store.get('tbt_name','')||('Cán bộ '+(10+Math.random()*89|0));
$('#pname').addEventListener('change',()=>{store.set('tbt_name',myName());netHello();});
$('#bRoll').onclick=()=>{
 audio();$('#bRoll').disabled=true;$('#bStart').hidden=true;let n=0;
 const iv=setInterval(()=>{$('#roll').textContent=pick(ROLES).name;tone(300+n*30,.04,'square',.04);if(++n>16){clearInterval(iv);
  let r=weightedRole();
  if(r.random)r={...r,speed:+rnd(.8,1.3).toFixed(2),energyDecay:+rnd(.7,1.4).toFixed(2),patience:Math.round(rnd(60,150)),zone:+rnd(.5,1.6).toFixed(2)};
  rolled=r;$('#roll').textContent=r.name;$('#rdesc').textContent=r.desc;$('#bRoll').disabled=false;$('#bRoll').textContent='🎲 Bốc lại';$('#bStart').hidden=false;SFX.ok();}},70);
};
$('#bStart').onclick=()=>{
 if(!rolled)return;audio();store.set('tbt_name',myName());
 newState(rolled);updateSigns();
 $('#roleName').textContent=rolled.name;$('#title').hidden=true;$('#end').hidden=true;S.taskKey='';
 if(NET.online)netHello();else netConnect();
 toast('7:30 – Vào ca. Lên Ban QLDA nhận hồ sơ!',3.5);say('Bảy giờ rưỡi. Vào ca. Lên Ban quản lý dự án nhận hồ sơ.','sep');
};
$('#bAgain').onclick=()=>{$('#end').hidden=true;$('#title').hidden=false;S=null;rolled=null;$('#roll').textContent='Chưa bốc';$('#rdesc').textContent='Không được chọn. Phòng tổ chức quay số.';$('#bRoll').textContent='🎲 Bốc thăm';$('#bStart').hidden=true;showProfile();};
function soundBtn(){$('#bSound').textContent=SND.on?'🔊':'🔇';}
$('#bSound').onclick=()=>{SND.on=!SND.on;store.set('tbt_sound',SND.on);soundBtn();if(!SND.on&&hasTTS)speechSynthesis.cancel();toast(SND.on?'Bật âm thanh và lồng tiếng':'Tắt âm thanh');};
$('#bChat').onclick=openChat;$('#bBoard').onclick=showBoard;$('#bInvite').onclick=invite;
$('#chatSend').onclick=sendChat;
$('#chatIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')sendChat();if(e.key==='Escape'){$('#chatbar').hidden=true;}});

/* =================== ĐIỀU KHIỂN =================== */
cv.addEventListener('pointerdown',e=>{if(!S||S.phase!=='play')return;$('#chatbar').hidden=true;const r=cv.getBoundingClientRect();joy.active=true;joy.id=e.pointerId;joy.bx=e.clientX-r.left;joy.by=e.clientY-r.top;joy.dx=joy.dy=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!joy.active||e.pointerId!==joy.id)return;const r=cv.getBoundingClientRect();let dx=e.clientX-r.left-joy.bx,dy=e.clientY-r.top-joy.by;const l=Math.hypot(dx,dy);if(l>48){dx*=48/l;dy*=48/l;}joy.dx=dx;joy.dy=dy;});
const endJoy=e=>{if(e.pointerId===joy.id)joy.active=false;};
cv.addEventListener('pointerup',endJoy);cv.addEventListener('pointercancel',endJoy);
$('#bAct').addEventListener('click',()=>{if(S&&S.near)doInteract(S.near);});
$('#bDash').addEventListener('pointerdown',e=>{e.preventDefault();dash();});
addEventListener('keydown',e=>{
 if(e.target&&e.target.tagName==='INPUT')return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(!S||S.phase!=='play')return;
 if(e.code==='Space'||e.code==='KeyE'){if(!e.repeat&&S.near)doInteract(S.near);return;}
 if(e.code==='ShiftLeft'||e.code==='ShiftRight'){dash();return;}
 if(e.code==='KeyT'){e.preventDefault();openChat();return;}
 keys[e.code]=true;
});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;joy.active=false;});

/* =================== VÒNG LẶP =================== */
const clock=new THREE.Clock();
function frame(){
 const dt=Math.min(.05,clock.getDelta()),t=clock.getElapsedTime();
 update(dt);
 if(S){sync(t,dt);netState(false);}
 else{const a=t*.08;camera.position.set(55+Math.cos(a)*55,38,75+Math.sin(a)*55);camera.lookAt(55,0,70);}
 renderer.render(scene,camera);overlay(t);
 if(S&&S.phase!=='end'){hudT-=dt;if(hudT<=0){hudT=.1;hud();}}
 requestAnimationFrame(frame);
}
if(window.TBT_DEBUG)window.__tbt={get S(){return S},get P(){return P},get NET(){return NET},ITEMS,CASES,DECIDE,doInteract,scene};
function start(){buildWorld();$('#loading').hidden=true;showProfile();soundBtn();voiceInfo();netInfo();requestAnimationFrame(frame);}
const fontLoad=document.fonts&&document.fonts.load?Promise.all([document.fonts.load(`900 40px ${FONT}`),document.fonts.load(`900 40px ${FONT}`,'Ộ')]):Promise.resolve();
Promise.race([fontLoad,new Promise(r=>setTimeout(r,2500))]).then(start,start);
})();
