import React from 'react';

import TeamInfoContainer from './TeamInfoContainer';

const TeamInfoPage = ({ match }) => <TeamInfoContainer requestedTeamId={match.params.requestedTeamId} />;

export default TeamInfoPage;
