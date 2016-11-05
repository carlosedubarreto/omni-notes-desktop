angular.module("ONApp").service("notesService", ['$rootScope', '$log', 'CONSTANTS', 'storageService', function($rootScope, $log, CONSTANTS, storageService) {

    var fs = require('fs');
    var notes = [];
    var categories = {};

    this.loadNotes = function(backupFolderPath) {
        fs.readdir(backupFolderPath, function(err, files) {
            var filtered = files.filter(function(fileName) {
                return new RegExp("[0-9]{13}\\.json").test(fileName);
            });
            filtered.forEach(function(fileName) {
                var filePath = backupFolderPath + '/' + fileName;
                $log.debug('Reading content of file: ' + filePath);
                fs.readFile(filePath, function(err, data) {
                    var note = JSON.parse(data);
                    notes.push(note);
                    if (note.category) {
                        categories[note.category.id] = note.category;
                    }
                    if (notes.length == filtered.length) {
                        storageService.put('notes_backup_folder', backupFolderPath);
                        $rootScope.$emit(CONSTANTS.NOTES_LOADED, notes);
                    }
                });
            });
        });
    };

    this.getNotes = function() {
        return notes;
    };

    this.getCategories = function() {
        return categories;
    };

    this.filterNotes = function(filterPredicate) {
        var filteredNotes = _.filter(notes, filterPredicate);
        $rootScope.$emit(CONSTANTS.NOTES_FILTERED, filteredNotes);
    };

    this.saveNotes = function(updatedNotes, updateLastModification) {
        var service = this;
        _.each(updatedNotes, function(updateNote) {
            service.saveNote(updateNote, updateLastModification, false);
        })
        $rootScope.$emit(CONSTANTS.NOTE_MODIFIED, notes);
    };

    this.archiveNotes = function(updatedNotes, archive) {
        var service = this;
        _.each(updatedNotes, function(updateNote) {
            updateNote.archived = archive;
            service.saveNote(updateNote, false, false);
        })
        $rootScope.$emit(CONSTANTS.NOTE_MODIFIED, notes);
    };

    this.saveNote = function(updatedNote, updateLastModification, emitEvent) {
        var now = new Date().getTime();
        updatedNote.lastModification = !updateLastModification ? updatedNote.lastModification : now;
        if (updatedNote.creation) {
            var i = _.findIndex(notes, function(note) {
                return note.creation == updatedNote.creation;
            })
            notes[i] = updatedNote;
        } else {
            updatedNote.creation = now;
            notes.push(updatedNote);
        }
        storageService.get('notes_backup_folder').then(function(notesBackupFolder) {
            fs.writeFile(notesBackupFolder + '/' + updatedNote.creation + '.json', JSON.stringify(updatedNote), function(err) {
                if (err) throw err;
                if (!(false == emitEvent)) {
                    $rootScope.$emit(CONSTANTS.NOTE_MODIFIED, notes);
                }
            });
        });
    };

    this.saveCategory = function(updatedCategory) {
        updatedCategory.id = updatedCategory.id || new Date().getTime();
        categories[updatedCategory.id] = updatedCategory;
        notes = _.each(notes, function(note) {
            if (note.category && note.category.id == updatedCategory.id) {
                note.category = updatedCategory;
            }
            return note;
        });
        $rootScope.$emit(CONSTANTS.CATEGORY_MODIFIED, categories);
    }

}]);
