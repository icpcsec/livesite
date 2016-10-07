import axios from 'axios';
import React from 'react';
import applyPartialUpdate from 'react-addons-update';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';
import * as constants from '../constants';
import * as settings from '../settings';

const UPDATE_AGREEMENT =
  settings.JA ?
  (
    <span>
      <b>重要</b>: このフォームで送信されたプロフィール情報はすべて一般に公開されます。<br />
      投稿されたプロフィール情報に関するすべての責任は投稿したチーム自身が負うこととします。<br />
      不快な情報や虚偽の情報を投稿してはいけません。<br />
      ウェブサイト運営者はいつでもプロフィールの公開を停止することがあります。
    </span>
  ) : (
    <span>
      <b>IMPORTANT</b>: By submitting this form, all information entered here are published and become visible to the public.<br />
      You are fully responsible for the submitted information; never post offensive or false information.<br />
      The website owners may take down profiles any time.
    </span>
  );

const PREFECTURE_DROPDOWN_ITEMS = constants.PREFECTURES.map((caption, index) => (
  { value: index, caption }
));
PREFECTURE_DROPDOWN_ITEMS.splice(0, 1);  // Do not show value=0

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

const CheckBoxFormItem = ({ value, caption, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };
  return (
    <GenericFormItem {...props}>
      <div className="checkbox">
        <label>
          <input type="checkbox" checked={value} onChange={handleChange} />
          {' '}
          {caption}
        </label>
      </div>
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

const DropdownFormItem = ({ value, items, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  const options = items.map(({ caption, value }) => (
    <option value={value}>{caption}</option>
  ));
  return (
    <GenericFormItem {...props}>
      <select className="form-control" value={value} onChange={handleChange}>
        {options}
      </select>
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

const PhotoFormItem = ({ label, url, ratio, help, onChange }) => {
  // HACK: Firefox does not propagate click to <input>.
  const handleClick = (e) => {
    $(e.target).find('input[type=file]').click();
  };
  const handleChange = (e) => onChange(e.target.files[0]);
  const helpElement = help ? <p className="help-block">{help}</p> : null;
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="form-control-static">
        <div className="thumbnail">
          <FixedRatioThumbnail url={url} ratio={ratio} />
        </div>
        <input type="text" readOnly={true} className="form-control" style={{display: 'none'}} />
        <button className="btn btn-default btn-raised" style={{position: 'relative'}} onClick={handleClick}>
          {settings.JA ? 'アップロード' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleChange} />
        </button>
      </div>
      {helpElement}
    </div>
  );
};

const IconFormItem = ({ label, url, help, onChange }) => {
  // HACK: Firefox does not propagate click to <input>.
  const handleClick = (e) => {
    $(e.target).find('input[type=file]').click();
  };
  const handleChange = (e) => onChange(e.target.files[0]);
  const helpElement = help ? <p className="help-block">{help}</p> : null;
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
        <button className="btn btn-default btn-raised" style={{ position: 'relative', verticalAlign: 'middle', marginLeft: '12px' }} onClick={handleClick}>
          {settings.JA ? 'アップロード' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleChange} />
        </button>
      </div>
      {helpElement}
    </div>
  );
};

const TeamEditPanel = ({ team: { name, university, country, prefecture, photo }, removePhoto, onFormChange, onPhotoChange }) => {
  const handlePrefectureChange = (value) => {
    onFormChange({team: {prefecture: {$set: parseInt(value)}}});
  };
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <form onSubmit={(e) => e.preventDefault()}>
          <StaticFormItem
            label={settings.JA ? 'チーム名 (編集できません)' : 'Team Name (not editable)'}
            value={name} />
          <StaticFormItem
            label={settings.JA ? '大学名 (編集できません)' : 'University (not editable)'}
            value={university} />
          {
            settings.ENABLE_PREFECTURE ?
            <DropdownFormItem
              label={settings.JA ? '大学所在地' : 'Prefecture'}
              items={PREFECTURE_DROPDOWN_ITEMS}
              value={prefecture || 48}
              onChange={handlePrefectureChange} /> :
            null
          }
          {
            settings.ENABLE_COUNTRY ?
            <StaticFormItem
              label={settings.JA ? '国 (編集できません)' : 'Country (not editable)'}
              value={country} /> :
            null
          }
          {
            settings.ENABLE_PHOTO_UPLOAD ?
            <div>
              <PhotoFormItem
                label={settings.JA ? 'チーム写真' : 'Team Photo'}
                url={photo}
                ratio={1 / 3}
                help={settings.JA ? 'チームメンバー全員が写った写真を投稿して下さい。自動的に 3:1 のアスペクト比で切り抜かれます。チーム写真がない場合、代わりにメンバーのアイコン画像が用いられます。' : 'TODO: TRANSLATE ME'}
                onChange={onPhotoChange} />
              <CheckBoxFormItem
                caption={settings.JA ? 'チーム写真を削除する' : 'Delete the current team photo'}
                value={removePhoto}
                onChange={(value) => onFormChange({removePhoto: {$set: value}})}
              />
            </div> :
            null
          }
        </form>
      </div>
    </div>
  );
};

const MemberEditPanel = ({ index, profile, removeIcon, onFormChange, onIconChange }) => {
  const handleIconChange = (file) => onIconChange(index, file);
  const handleFormChangeForMember = (update) => onFormChange({team: {members: {[index]: update}}});
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <h3>{settings.JA ? 'メンバー' : 'Member'} {index + 1}</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextFormItem
            label={settings.JA ? '名前' : 'Name'}
            value={profile.name}
            help={settings.JA ? '本名でもニックネームでも構いません。' : 'Both real name and nick name are fine.' }
            onChange={(value) => handleFormChangeForMember({name: {$set: value.substr(0, 32)}})}
          />
          {
            settings.ENABLE_ICON ?
            <div>
              <IconFormItem
                label={settings.JA ? 'アイコン' : 'Icon'}
                url={profile.icon}
                onChange={handleIconChange}
              />
              <CheckBoxFormItem
                caption={settings.JA ? 'アイコンを削除する' : 'Delete the current icon'}
                value={removeIcon}
                onChange={(value) => onFormChange({removeIcon: {[index]: {$set: value}}})}
              />
            </div> :
            null
          }
          <GridFlow cols={3}>
            <TextFormItem
              label="TopCoder ID"
              value={profile.topcoderId}
              onChange={(value) => handleFormChangeForMember({topcoderId: {$set: value.substr(0, 16)}})}
            />
            <TextFormItem
              label="CodeForces ID"
              value={profile.codeforcesId}
              onChange={(value) => handleFormChangeForMember({codeforcesId: {$set: value.substr(0, 16)}})}
            />
            <TextFormItem
              label="Twitter ID"
              value={profile.twitterId}
              onChange={(value) => handleFormChangeForMember({twitterId: {$set: value.substr(0, 16)}})}
            />
            <TextFormItem
              label="Github ID"
              value={profile.githubId}
              onChange={(value) => handleFormChangeForMember({githubId: {$set: value.substr(0, 16)}})}
            />
          </GridFlow>
          <TextFormItem
            label={settings.JA ? 'ひとこと' : 'Message'}
            value={profile.comment}
            help={settings.JA ? `${settings.COMMENT_LIMIT_CHARS}文字以内で好きなメッセージを入力してください。` : `Message up to ${settings.COMMENT_LIMIT_CHARS} characters.`}
            onChange={(value) => handleFormChangeForMember({comment: {$set: value.substr(0, settings.COMMENT_LIMIT_CHARS)}})}
          />
        </form>
      </div>
    </div>
  );
};

const SubmitPanel = ({ agreed, password, onChange, onSubmit, onAgree }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <form>
        <StaticFormItem value={UPDATE_AGREEMENT} />
        <GridFlow cols={3}>
          <CheckBoxFormItem
            caption={settings.JA ? '同意する' : 'I agree'}
            value={agreed}
            onChange={onAgree}
          />
          <div />
          <PasswordFormItem label={settings.JA ? 'チーム情報編集パスワード' : 'Live website password'} value={password} onChange={onChange} />
          <div className="form-group">
            <fieldset disabled={!(agreed && password)}>
              <button className="btn btn-primary btn-raised" onClick={onSubmit}>
                {settings.JA ? '更新' : 'UPDATE'}
              </button>
            </fieldset>
          </div>
        </GridFlow>
      </form>
    </div>
  </div>
);

class TeamEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team: props.team,
      teamPhotoFile: null,
      removePhoto: false,
      iconFiles: [null, null, null],
      removeIcon: [false, false, false],
      password: '',
      agreed: false,
    };
  }

  handlePasswordChange(password) {
    this.setState({ password });
  }

  handleFormChange(update) {
    console.log(applyPartialUpdate(this.state, update));
    this.setState(applyPartialUpdate(this.state, update));
  }

  handlePhotoChange(file) {
    if (!file) {
      return;
    }
    if (file.size >= 4 * 1024 * 1024) {
      $.snackbar({
        content: settings.JA ? 'アップロードできるチーム写真ファイルの最大サイズは 4MB です。' : 'The maximum size of a team photo file is 4MB.',
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
    if (!file) {
      return;
    }
    if (file.size >= 256 * 1024) {
      $.snackbar({
        content: settings.JA ? 'アップロードできるアイコンファイルの最大サイズは 256KB です。' : 'The maximum size of an icon file is 256KB.',
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

  handleToggleAgreed() {
    this.setState(applyPartialUpdate(this.state, {
      agreed: {$set: !this.state.agreed},
    }));
  }

  handleSubmitClick(e) {
    e.preventDefault();
    const form = new FormData();
    form.append('id', this.state.team.id);
    form.append('prefecture', this.state.team.prefecture || 48);
    this.state.team.members.forEach((profile, i) => {
      form.append(`members.${i}.name`, profile.name);
      form.append(`members.${i}.topcoderId`, profile.topcoderId);
      form.append(`members.${i}.codeforcesId`, profile.codeforcesId);
      form.append(`members.${i}.twitterId`, profile.twitterId);
      form.append(`members.${i}.githubId`, profile.githubId);
      form.append(`members.${i}.comment`, profile.comment);
      if (this.state.removeIcon[i]) {
        form.append(`members.${i}.removeIcon`, '1');
      } else if (this.state.iconFiles[i]) {
        form.append(`members.${i}.iconFile`, this.state.iconFiles[i]);
      }
    });
    if (this.state.removePhoto) {
      form.append('removePhoto', '1');
    } else if (this.state.teamPhotoFile) {
      form.append('teamPhotoFile', this.state.teamPhotoFile);
    }
    form.append('password', this.state.password);
    axios.post('/api/ui/update_team', form).then((response) => {
      if (response.data.ok) {
        $.snackbar({
          content: settings.JA ? '正常に更新されました。' : 'Updated successfully.',
          timeout: 5000,
        });
        this.context.loader.loadFeed('teams').then(() => {
          this.context.router.push(`/team/${this.state.team.id}`);
        });
      } else {
        $.snackbar({
          content: (settings.JA ? '更新に失敗しました: ' : 'Update failed: ') + response.data.message,
          timeout: 5000,
        });
      }
    }, (err) => {
      $.snackbar({
        content: settings.JA ? 'サーバーエラーが発生しました。時間を置いてやり直して下さい。' : 'Encountered a server error. Please try again after a minute.',
        timeout: 5000,
      });
    });
  }

  componentDidMount() {
    // Install handlers to <input type=file>.
    $.material.input();
    // Install handlers to <input type=checkbox>.
    $.material.checkbox();
  }

  render() {
    if (!this.state.team) {
      return <ErrorMessage header="Team Not Found" />;
    }
    const memberElements = this.state.team.members.map((profile, index) => {
      return (
        <MemberEditPanel
          key={index}
          index={index}
          profile={profile}
          removeIcon={this.state.removeIcon[index]}
          onFormChange={this.handleFormChange.bind(this)}
          onIconChange={this.handleIconChange.bind(this)}
        />
      );
    });
    return (
      <div>
        <div className="page-header">
          <h1>{settings.JA ? 'チーム情報編集' : 'Edit Team Info'}</h1>
        </div>
        <TeamEditPanel
          team={this.state.team}
          removePhoto={this.state.removePhoto}
          onFormChange={this.handleFormChange.bind(this)}
          onPhotoChange={this.handlePhotoChange.bind(this)}
        />
        {memberElements}
        <SubmitPanel
          agreed={this.state.agreed}
          password={this.state.password}
          onChange={this.handlePasswordChange.bind(this)}
          onSubmit={this.handleSubmitClick.bind(this)}
          onAgree={this.handleToggleAgreed.bind(this)}
        />
      </div>
    );
  }
};
TeamEdit.contextTypes = {
  router: () => React.PropTypes.func.isRequired,
  loader: () => React.PropTypes.func.isRequired,
};

export default TeamEdit;
