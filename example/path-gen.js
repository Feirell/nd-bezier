import {
    SimpleSVG
} from "./simple-svg.js";

import {
    Bezier
} from "../lib/bezier.js";

import {
    level,
    sum
} from '../lib/math-functions.js';

(function () {
    const svgContainer = document.getElementById('svg-container');
    const tSlider = document.getElementById('t-slider');

    // const bezier = new(Function.prototype.bind.apply(Bezier, [undefined].concat(holdingPoints)));

    function drawBaseBezierLine(simpleSVG, className, stepDistance, bezier) {
        let steps = stepDistance;
        if (stepDistance < 1)
            steps = Math.round(1 / stepDistance);

        const points = new Array(steps);
        for (let i = 0; i <= steps; i++)
            points[i] = bezier.at(i / steps);

        simpleSVG.createPolyline(className + ' graph-parts', points);
    }

    function interactiveBezier(simpleSVG, className, bezier) {
        drawBaseBezierLine(simpleSVG, className, 0.01, bezier)
        let interDots = [];
        let interDotLines = [];

        const c = {
            x: 0,
            y: 0
        };

        const dotsAmount = sum(bezier.grade + 1);
        const linesAmount = sum(bezier.grade);


        for (let i = 0; i < linesAmount; i++) {
            const currentLevel = level(bezier.grade - 1, i);
            const itemClassString = 'line ' + className + ' ' + ((currentLevel == 0 || i == dotsAmount - 1) ? (currentLevel == 0 ? 'holding' : 'final') : 'intermidiate intermidiate-' + currentLevel);
            interDotLines[i] = simpleSVG.createLine(itemClassString, c, c);
        }

        for (let i = 0; i < dotsAmount; i++) {
            const currentLevel = level(bezier.grade, i);
            const itemClassString = 'point ' + className + ' ' + ((currentLevel == 0 || i == dotsAmount - 1) ? (currentLevel == 0 ? 'holding' : 'final') : 'intermidiate intermidiate-' + currentLevel) + ' pointname-' + String.fromCharCode(65 + i);
            interDots[i] = simpleSVG.createCircleAt(0, 0, itemClassString);
        }

        function setPointAt(t) {
            let points = bezier.atWithIntermidiate(t);

            let interDotLineCounter = 0;
            for (let i = 0; i < points.length; i++) {

                interDots[i].cx.baseVal.value = points[i].x;
                interDots[i].cy.baseVal.value = points[i].y;

                if (level(bezier.grade, i) == level(bezier.grade, i + 1)) {
                    interDotLines[interDotLineCounter].x1.baseVal.value = points[i].x;
                    interDotLines[interDotLineCounter].y1.baseVal.value = points[i].y;
                    interDotLines[interDotLineCounter].x2.baseVal.value = points[i + 1].x;
                    interDotLines[interDotLineCounter].y2.baseVal.value = points[i + 1].y;

                    interDotLineCounter++;
                }
            }
        }

        setPointAt(0.5);

        return {
            setPointAt: setPointAt
        }
    }

    const interactives = []
    interactives[interactives.length] = interactiveBezier(new SimpleSVG(document.getElementById('svg-container-a')), 'bez-1', new Bezier([{
        x: 15,
        y: 15
    }, {
        x: 65,
        y: 15
    }, {
        x: 85,
        y: 135
    }, {
        x: 135,
        y: 135
    }]));

    interactives[interactives.length] = interactiveBezier(new SimpleSVG(document.getElementById('svg-container-b')), 'bez-2', new Bezier([{
        x: 15,
        y: 105
    }, {
        x: 35,
        y: 65
    }, {
        x: 55,
        y: 45
    }, {
        x: 95,
        y: 45
    }, {
        x: 115,
        y: 65
    }, {
        x: 135,
        y: 105
    }]));

    interactives[interactives.length] = interactiveBezier(new SimpleSVG(document.getElementById('svg-container-c')), 'bez-3', new Bezier([{
        x: 15,
        y: 135
    }, {
        x: 135,
        y: 15
    }, {
        x: 135,
        y: 135
    }, {
        x: 15,
        y: 135
    }]));

    {
        let changed = true;
        let t = 0.5;

        function cycle() {
            if (changed) {
                const nt = t;
                changed = false;
                for (let int of interactives)
                    int.setPointAt(nt);
            }

            requestAnimationFrame(cycle)
        }

        requestAnimationFrame(cycle)

        tSlider.addEventListener('input', function (ev) {
            const nt = parseFloat(ev.target.value);
            if (nt != t) {
                changed = true;
                t = nt;
            }

        })
    }
})()