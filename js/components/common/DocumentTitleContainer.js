import { connect } from 'react-redux';

import DocumentTitle from 'react-document-title';

const mapStateToProps = ({ contest: { title } }) => ({ title });

const DocumentTitleContainer = connect(mapStateToProps)(DocumentTitle);

export default DocumentTitleContainer;
