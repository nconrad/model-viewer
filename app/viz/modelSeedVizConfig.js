
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
        this.geneColor = '#87CEEB';
        this.negFluxColors = ['#910000', '#e52222', '#ff4444', '#fc8888', '#fcabab'];
        this.fluxColors = ['#0d8200', '#1cd104','#93e572','#99db9d', '#c7e8cd'];
        this.bounds = [100, 50, 5, 1, 0];
        this.negBounds = [0, -1, -5, -50, -100];

        this.stroke = "#888";
        this.strokeDark = '#000';
        this.highlight = 'steelblue';


        this.getColor = function(v) {
            if (v >= this.bounds[0])
                return this.fluxColors[0];
            else if (v >= this.bounds[1])
                return this.fluxColors[1];
            else if (v >= this.bounds[2])
                return this.fluxColors[2];
            else if (v >= this.bounds[3])
                return this.fluxColors[3];
            else if (v > this.bounds[4])
                return this.fluxColors[4];
            else if (v === 0)
                return this.gene_color;
            else if (v <= this.negBounds[4])
                return this.negFluxColors[0];
            else if (v <= this.negBounds[3])
                return this.negFluxColors[1];
            else if (v <= this.negBounds[2])
                return this.negFluxColors[2];
            else if (v <= this.negBounds[1])
                return this.negFluxColors[3];
            else if (v < 0)
                return this.negFluxColors[4];

            return undefined;
        }
    }

    return ModelSeedVizConfig;
})();