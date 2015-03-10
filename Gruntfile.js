module.exports = function(grunt) {

    // Project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            copyindex: {
                src: 'app/index.html',
                dest: 'app/dev.html'
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: './app/'
            }
        },
        usemin: {
            html: ['app/index.html'],
            options: {
                assetsDirs: ['build']
            }
        },
        watch: {
            files: ['app/css/*', 'app/js/*'],
            tasks: ['uglify']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-usemin');


    grunt.registerTask('build', ['copy:copyindex',
                                 'useminPrepare',
                                 'concat',
                                 'cssmin:generated',
                                 'uglify:generated',
                                 'usemin']);


    //grunt.registerTask('default', ['ngAnnotate','uglify']);

};