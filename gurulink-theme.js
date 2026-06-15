(function(){
function getTheme(){
return localStorage.getItem("theme") || localStorage.getItem("gurulinkTheme") || "light";
}

function applyTheme(theme){
var isDark = theme === "dark";
document.documentElement.classList.toggle("gurulink-dark",isDark);
if(document.body){
document.body.classList.toggle("dark",isDark);
document.body.setAttribute("data-theme",isDark ? "dark" : "light");
}
}

applyTheme(getTheme());

document.addEventListener("DOMContentLoaded",function(){
applyTheme(getTheme());
});

window.addEventListener("pageshow",function(){
applyTheme(getTheme());
});

document.addEventListener("visibilitychange",function(){
applyTheme(getTheme());
});

window.addEventListener("storage",function(e){
if(e.key === "theme" || e.key === "gurulinkTheme"){
applyTheme(getTheme());
}
});

window.GurulinkTheme = {
setTheme:function(theme){
localStorage.setItem("theme",theme);
localStorage.setItem("gurulinkTheme",theme);
applyTheme(theme);
},
apply:function(){
applyTheme(getTheme());
}
};
})();
