/**
 * Provides a view of all tags. Key is the tag id, value the tag. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
  if (doc.type == "tag") {
    emit(doc,null);
  }
};
