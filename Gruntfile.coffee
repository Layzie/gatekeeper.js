### global module:false ###
module.exports = (grunt) ->
  # Project configuration.
  grunt.initConfig(
    pkg: grunt.file.readJSON 'package.json'

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'

    concat:
      options:
        banner: '<%= banner %>'
        stripBanners: true
      dist:
        src: ['lib/<%= pkg.name %>.js']
        dest: '<%= pkg.name %>.js'

    uglify:
      options:
        banner: '<%= banner %>'
      dist:
        files:
          '<%= pkg.name %>.min.js': '<%= concat.dist.dest %>'

    clean:
      build:
        src: ['src/*.js', 'test/*-test.js']

    coffee:
      compile:
        options:
          bare: true
          sourceMaps: true
        files:
          'lib/<%= pkg.name %>.js': 'src/<%= pkg.name %>.coffee'

    watch:
      lib:
        files: ['Gruntfile.coffee', 'src/**/*.coffee', 'test/**/*-test.coffee']
        tasks:['coffee', 'clean']

    jshint:
      options:
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        boss: true
        eqnull: true
        browser: true
        globals:
          browser: true,
          devel: true,
          Gk: true
  )

  # Default task.
  grunt.registerTask 'default', ['concat', 'uglify']

  # Develop task.
  grunt.registerTask 'develop', ['buster']

  # load grunt-contrib
  grunt.loadNpmTasks 'grunt-contrib'
