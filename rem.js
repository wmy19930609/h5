/**
 * Created by lvlq on 16/1/29.
 */
!function (N, M) {
    function L() {
        var a = I.getBoundingClientRect().width;
        var srceenW = screen.width,boundW = I.getBoundingClientRect().width;
        var a = boundW>srceenW?srceenW:boundW;

        a / F > 2000 && (a = 2000 * F);
        var d = a / 16;
        if (d < 22) d = 22;
        if(d == 25.875){d=24.5}
        if(d > 25.875){d=25.875}
        I.style.fontSize = d + "px", D.rem = N.rem = d
    }
    var K,
        J = N.document,
        I = J.documentElement,
        H = J.querySelector('meta[name="viewport"]'),
        G = J.querySelector('meta[name="flexible"]'),
        F = 0,
        E = 0,
        D = M.flexible || (M.flexible = {});
    if (H) {
        var C = H.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        C && (E = parseFloat(C[1]), F = parseInt(1 / E))
    } else {
        if (G) {
            var B = G.getAttribute("content");
            if (B) {
                var A = B.match(/initial\-dpr=([\d\.]+)/), z = B.match(/maximum\-dpr=([\d\.]+)/);
                A && (F = parseFloat(A[1]), E = parseFloat((1 / F).toFixed(2))), z && (F = parseFloat(z[1]), E = parseFloat((1 / F).toFixed(2)))
            }
        }
    }
    if (!F && !E) {
        var y = N.navigator.userAgent,
            x = !y.match(/android/gi),
            // w = x && !!y.match(/OS 9_3/),
            w = x && false,
            v = N.devicePixelRatio;
        F = x && !w ? v >= 3 && (!F || F >= 3) ? 3 : v >= 2 && (!F || F >= 2) ? 2 : 1 : 1, E = 1 / F
    }
    if (I.setAttribute("data-dpr", F), !H) {
        if (H = J.createElement("meta"), H.setAttribute("name", "viewport"), H.setAttribute("content", "initial-scale=" + E + ", maximum-scale=" + E + ", minimum-scale=" + E + ", user-scalable=no"), I.firstElementChild) {
            I.firstElementChild.appendChild(H)
        } else {
            var u = J.createElement("div");
            u.appendChild(H), J.write(u.innerHTML)
        }
    }
    L(), D.dpr = N.dpr = F, D.refreshRem = L, D.rem2px = function (d) {
        var c = parseFloat(d) * this.rem;
        return "string" == typeof d && d.match(/rem$/) && (c += "px"), c
    }, D.px2rem = function (d) {
        var c = parseFloat(d) / this.rem;
        return "string" == typeof d && d.match(/px$/) && (c += "rem"), c
    }
}(window, window.lib || (window.lib = {}));