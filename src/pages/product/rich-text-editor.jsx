import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import _ from 'lodash'

// 这一步很关键 要导入富文本的样式文件 不然没有效果
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'


export default class RichTextEditor extends Component {

  static propTypes = {
    detail: PropTypes.string
  }
  state = {
    editorState: EditorState.createEmpty(),
  }

  onEditorStateChange = _.debounce((editorState) => {
    console.log('----')//这样的操作很频繁 可以使用函数防抖处理
    this.setState({
      editorState,
    });
  }, 500)

  uploadImageCallBack = (file) => {
    return new Promise(
      (resolve, reject) => {// 执行器函数
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/manage/img/upload');
        xhr.setRequestHeader('Authorization', 'Client-ID XXXXX');
        const data = new FormData();
        data.append('image', file);
        xhr.send(data);
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText); // {status:0, data: {name: '', url: '....'}}
          const url = response.data.url
          delete response.data.url
          response.data.link = url
          resolve(response);
        });
        xhr.addEventListener('error', () => {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        });
      }
    );
  }

  componentWillMount () {
    const detail = this.props.detail
    if (detail) {
      // 根据detail生成一个editorState
      const contentBlock = htmlToDraft(detail)
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      // 更新状态
      this.setState({
        editorState
      })
    }
  }

  getDetail = () => draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))

  render() {
    const { editorState } = this.state;
    return (
      <div>
        <Editor
          editorState={editorState}
          editorStyle={{height: 200, border: '1px solid black', paddingLeft: 10 }}
          onEditorStateChange={this.onEditorStateChange}
          // 上传图片配置
          toolbar={{
            image: { uploadCallback: this.uploadImageCallBack, alt: { present: true, mandatory: true } },
          }}
        />
      </div>
    );
  }
}