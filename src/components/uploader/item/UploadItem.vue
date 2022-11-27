<template>
  <li class="list-group-item d-flex justify-content-between align-items-center">
    <p :class="uploadItemClasses">
      <component :is="iconFileType" />
      <span>{{ item.file.name }}</span>
    </p>
    <span class="failed-text" v-show="isCanceled">Upload canceled</span>
    <UploadControls
      :item="item"
      @cancel="handleCancel"
      @retry="handleRetry"
      @locate="handleLocate"
    />
  </li>
</template>

<script>
import UploadControls from "./UploadControls.vue";
import { reactive, onMounted, computed, watch, inject } from "vue";
import { useIconFileType } from "../../../composable/icon-file-type";
import filesApi from "../../../api/files";
import states from "../states";
import axios from "axios";
import useUploadStates from "../../../composable/upload-states";

const createFormData = (upload) => {
  const formData = new FormData();
  formData.append("file", upload.file);
  formData.append("folderId", upload.folderId);
  return formData;
};

const startUpload = async (upload, source) => {
  try {
    upload.state = states.UPLOADING;

    const { data } = await filesApi.create(createFormData(upload), {
      onUploadProgress: (e) => {
        if (e.lengthComputable) {
          upload.progress = Math.round((e.loaded / e.total) * 100);
        }
      },
      cancelToken: source.token,
    });
    upload.state = states.COMPLETE;
    upload.response = data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      upload.state = states.FAILED;
    }
    upload.progress = 0;
  }
};

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  components: { UploadControls },
  setup(props, { emit }) {
    const uploadItem = reactive(props.item);
    let source = axios.CancelToken.source();

    const { isCanceled } = useUploadStates(uploadItem);

    const uploadItemClasses = computed(() => {
      return {
        "upload-item": true,
        failed: isCanceled.value,
      };
    });

    const setSelectedItem = inject("setSelectedItem");
    const handleLocate = () => {
      setSelectedItem([uploadItem.response]);
    };

    onMounted(startUpload(uploadItem, source));

    watch(
      () => [uploadItem.progress, uploadItem.state],
      () => {
        if (uploadItem.state === states.CANCELED) {
          source.cancel();
        } else if (uploadItem.state === states.WAITING) {
          handleRetry();
        }
        emit("change", uploadItem);
      }
    );

    const handleCancel = () => {
      uploadItem.state = states.CANCELED;
    };

    const handleRetry = () => {
      source = axios.CancelToken.source();
      startUpload(uploadItem, source);
    };

    return {
      iconFileType: useIconFileType(props.item.file.type),
      uploadItem,
      handleCancel,
      handleRetry,
      handleLocate,
      isCanceled,
      uploadItemClasses,
    };
  },
  emits: ["change"],
};
</script>

<style scoped>
.upload-item {
  line-height: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.upload-item,
.failed-text {
  color: #6c757d;
}

.upload-item span,
.failed-text {
  font-size: 12px;
}

.upload-item span {
  margin-left: 6px;
}

.failed {
  width: 140px;
  color: #212529;
}
</style>
