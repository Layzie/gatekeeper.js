/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js']
    },
    buster: {
      test: {
        config: './test/buster.js'
      }
    },
    clean: {
      src: ['./src/*.js']
    },
    coffee: {
      compile: {
        options: {
          bare: true
        },
        files: {
          './lib/*.js': ['./src/*.coffee']
        }
      }
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:lib/<%= pkg.name %>.js>'],
        dest: '<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: '<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'buster'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        browser: true,
        devel: true
      }
    },
    uglify: {}
  });

    // Default task.
    grunt.registerTask('default', 'concat min');

    // Develop task.
    grunt.registerTask('develop', 'buster');

    // load grunt-contrib
    grunt.loadNpmTasks('grunt-contrib');

    // load grunt-buster
    grunt.loadNpmTasks('grunt-buster');
};
