import React from 'react';
import applyPartialUpdate from 'react-addons-update';
import deepEqual from 'deep-equal';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';

function loadFileAsDataUrl(file) {
  return  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(reader.result);
    reader.onerror = (e) => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const GenericFormItem = ({ label, help, children }) => {
  const labelElement = label ? <label>{label}</label> : null;
  const helpElement = help ? <p className="help-block">{help}</p> : null;
  return (
    <div className="form-group">
      {labelElement}
      {children}
      {helpElement}
    </div>
  );
};

const TextFormItem = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <GenericFormItem {...props}>
      <input className="form-control" type="text" value={value} onChange={handleChange} />
    </GenericFormItem>
  );
};

const PasswordFormItem = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <GenericFormItem {...props}>
      <input className="form-control" type="password" value={value} onChange={handleChange} />
    </GenericFormItem>
  );
};

const StaticFormItem = ({ value, ...props }) => {
  return (
    <GenericFormItem {...props}>
      <p className="form-control-static">{value}</p>
    </GenericFormItem>
  );
};

const PhotoFormItem = ({ label, url, ratio, onChange }) => {
  const handleChange = (e) => onChange(e.target.files[0]);
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="form-control-static">
        <div className="thumbnail">
          <FixedRatioThumbnail url={url} ratio={ratio} />
        </div>
        <input type="text" readOnly={true} className="form-control" style={{display: 'none'}} />
        <button className="btn btn-default btn-raised" style={{position: 'relative'}}>
          アップロード
          <input type="file" accept="image/*" onChange={handleChange} />
        </button>
      </div>
    </div>
  );
};

const IconFormItem = ({ label, url, onChange }) => {
  const handleChange = (e) => onChange(e.target.files[0]);
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="form-control-static">
        <div className="thumbnail" style={{ display: 'inline-block', verticalAlign: 'middle', marginBottom: '0' }}>
          <div style={{ width: '80px' }}>
            <FixedRatioThumbnail url={url} ratio={1} />
          </div>
        </div>
        <input type="text" readOnly={true} className="form-control" style={{display: 'none'}} />
        <button className="btn btn-default btn-raised" style={{ position: 'relative', verticalAlign: 'middle', marginLeft: '12px' }}>
          アップロード
          <input type="file" accept="image/*" onChange={handleChange} />
        </button>
      </div>
    </div>
  );
};

const TeamEditPanel = ({ team: { name, university, photo }, onFormChange, onPhotoChange }) => {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <form>
          <StaticFormItem label="チーム名 (編集できません)" value={name} />
          <StaticFormItem label="大学名 (編集できません)" value={university} />
          <PhotoFormItem label="チーム写真" url={photo} ratio={1 / 3} onChange={onPhotoChange} />
        </form>
      </div>
    </div>
  );
};

const MemberEditPanel = ({ index, profile, onFormChange, onIconChange }) => {
  const handleIconChange = (file) => onIconChange(index, file);
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <h3>Member {index + 1}</h3>
        <form>
          <TextFormItem
            label="名前"
            value={profile.name}
            help="本名でもニックネームでも構いません。"
            onChange={(value) => onFormChange({name: {$set: value}})}
          />
          <IconFormItem
            label="アイコン"
            url={profile.icon}
            onChange={handleIconChange}
          />
          <GridFlow cols={3}>
            <TextFormItem
              label="TopCoder ID"
              value={profile.topcoderId}
              onChange={(value) => onFormChange({topcoderId: {$set: value}})}
            />
            <TextFormItem
              label="CodeForces ID"
              value={profile.codeforcesId}
              onChange={(value) => onFormChange({codeforcesId: {$set: value}})}
            />
            <TextFormItem
              label="Twitter ID"
              value={profile.twitterId}
              onChange={(value) => onFormChange({twitterId: {$set: value}})}
            />
            <TextFormItem
              label="Github ID"
              value={profile.githubId}
              onChange={(value) => onFormChange({githubId: {$set: value}})}
            />
          </GridFlow>
          <TextFormItem
            label="ひとこと"
            value={profile.comment}
            help="140文字以内で好きなメッセージを入力してください。"
            onChange={(value) => onFormChange({comment: {$set: value.substr(0, 140)}})}
          />
        </form>
      </div>
    </div>
  );
};

const SubmitPanel = ({}) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <form>
        <StaticFormItem value="このフォームで送信されたプロフィール情報はすべて一般に公開されます。公開に同意してプロフィール情報を更新する場合は、プロフィール編集パスワードを以下に入力し「更新」を押して下さい。" />
        <PasswordFormItem label="プロフィール編集パスワード" value="" />
        <div className="form-group">
          <button className="btn btn-primary btn-raised">更新</button>
        </div>
      </form>
    </div>
  </div>
);

class TeamEdit extends React.Component {
  resetState(newProps) {
    this.setState({
      team: newProps.team,
      teamPhotoFile: null,
      iconFiles: [null, null, null],
    });
  }

  handleFormChange(update) {
    this.setState(applyPartialUpdate(this.state, update));
  }

  handlePhotoChange(file) {
    if (file.size >= 1 * 1024 * 1024) {
      $.snackbar({
        content: 'アップロードできるチーム写真ファイルの最大サイズは 1MB です。',
        timeout: 5000,
      });
      return;
    }
    loadFileAsDataUrl(file).then((url) => {
      this.setState(applyPartialUpdate(this.state, {
        teamPhotoFile: {$set: file},
        team: {
          photo: {$set: url},
        },
      }));
    });
  }

  handleIconChange(memberIndex, file) {
    if (file.size >= 256 * 1024) {
      $.snackbar({
        content: 'アップロードできるアイコンファイルの最大サイズは 256KB です。',
        timeout: 5000,
      });
      return;
    }
    loadFileAsDataUrl(file).then((url) => {
      this.setState(applyPartialUpdate(this.state, {
        iconFiles: {
          [memberIndex]: {$set: file},
        },
        team: {
          members: {
            [memberIndex]: {
              icon: {$set: url},
            },
          },
        },
      }));
    });
  }

  componentWillMount() {
    this.resetState(this.props);
  }

  componentDidMount() {
    // Install handlers to <input type=file>.
    $.material.input();
  }

  componentWillReceiveProps(newProps) {
    this.resetState(newProps);
  }

  render() {
    if (!this.state.team) {
      return <ErrorMessage header="Team Not Found" />;
    }
    const memberElements = this.state.team.members.map((profile, index) => {
      const handleFormChangeForMember = (update) => this.handleFormChange(
        {team: {members: {[index]: update}}});
      return (
        <MemberEditPanel
          index={index}
          profile={profile}
          onFormChange={handleFormChangeForMember}
          onIconChange={this.handleIconChange.bind(this)}
        />
      );
    });
    return (
      <div>
        <div className="page-header">
          <h1>チーム情報編集</h1>
        </div>
        <TeamEditPanel
          team={this.state.team}
          onFormChange={this.handleFormChange.bind(this)}
          onPhotoChange={this.handlePhotoChange.bind(this)}
        />
        {memberElements}
        <SubmitPanel />
      </div>
    );
  }
};

export default TeamEdit;
