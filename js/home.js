const enterBtn = document.querySelector(".hero-enter");
const bladeContainer = document.querySelector(".blade-container");
let locked = false;

// hover 控制刀出鞘
enterBtn.addEventListener("mouseenter", ()=>{
  bladeContainer.classList.add("active");
});

enterBtn.addEventListener("mouseleave", ()=>{
  bladeContainer.classList.remove("active");
});

enterBtn.addEventListener("click", function(e){
  e.preventDefault();

  if(locked) return;
  locked = true;

  // 阶段1：黑裂痕
  document.body.classList.add("phase-1");

  // 阶段2：黑扩散
  setTimeout(()=>{
    document.body.classList.add("phase-2");
  },900);

  // 停顿一下（关键）
  setTimeout(()=>{
    document.body.classList.add("phase-3");
  },2000);

  // 阶段4：米扩散
  setTimeout(()=>{
    document.body.classList.add("phase-4");
  },2800);

  // 跳转
  setTimeout(()=>{
    window.location.href = "index.html";
  },4000);
});