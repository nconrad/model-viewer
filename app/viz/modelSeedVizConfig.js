
/*
 * This is a configuration file for settings related
 * to modeling visualizations.
 *
 * Note: JS was chosen instead of
 * CSS due to programmatic needs and simplicity.
 * Written as generic JS object for re-usability
 */

var ModelSeedVizConfig = (function() {
    'use strict';

    function ModelSeedVizConfig() {
        var gene_color = '#87CEEB',
            negFluxColors = ['#910000', '#e52222', '#ff4444', '#fc8888', '#fcabab'],
            fluxColors = ['#0d8200', '#1cd104','#93e572','#99db9d', '#c7e8cd'],
            negBounds = [0, -25, -200, -500, -1000],
            bounds = [1000, 500, 200, 25, 0];

        this.geneColor = gene_color;
        this.negFluxColors = negFluxColors;
        this.fluxColors = fluxColors;
        this.negBounds = negBounds;
        this.bounds = bounds;
        this.stroke = "#888";

        this.getColor = function(v) {
            if (v >= bounds[0])
                return fluxColors[0];
            else if (v >= bounds[1])
                return fluxColors[1];
            else if (v >= bounds[2])
                return fluxColors[2];
            else if (v >= bounds[3])
                return fluxColors[3];
            else if (v > bounds[4])
                return fluxColors[4];
            else if (v === bounds[4])
                return gene_color;
            else if (v <= negBounds[1])
                return negFluxColors[0];
            else if (v <= negBounds[2])
                return negFluxColors[1];
            else if (v <= negBounds[3])
                return negFluxColors[2];
            else if (v <= negBounds[4])
                return negFluxColors[3];
            else if (v < 0)
                return negFluxColors[4];

            return undefined;
        }
    }

    return ModelSeedVizConfig;
})();