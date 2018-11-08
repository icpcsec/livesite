import { connect } from 'react-redux';

import DocumentTitle from 'react-document-title';

const mapStateToProps = ({ feeds: { contest: { title } } }) => ({ title: (title || 'LiveSite') });

const DocumentTitleUpdater = connect(mapStateToProps)(DocumentTitle);

export default DocumentTitleUpdater;
