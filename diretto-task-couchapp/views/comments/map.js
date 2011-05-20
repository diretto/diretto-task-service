/**
 * Provides a view of all comments. Key is the [task id,comment id], value the comment. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
  if (doc.type == "task") {
    emit(doc,null);
  }
};
