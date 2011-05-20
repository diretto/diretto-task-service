/**
 * Provides a view of all submissions. Key is [task id, submission id], value the submission. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
  if (doc.type == "task") {
    emit(doc,null);
  }
};
