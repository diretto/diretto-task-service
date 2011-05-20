/**
 * Provides a view of all tasks as snapshots. Key is the task id, value the snapshot. 
 * 
 * @author Benjamin Erb
 */
function(doc) {
  if (doc.type == "task") {
    emit(doc,null);
  }
};
