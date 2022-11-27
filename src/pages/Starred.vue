<template>
  <div class="container-fluid">
    <div
      class="
        pt-2
        pb-3
        border-bottom
        d-flex
        justify-content-between
        align-items-center
      "
    >
      <span class="h5 mb-0">Starred</span>
      <a
        href="#"
        class="rounded-button"
        title="Remove from starred"
        v-if="selectedItems.length"
        @click.prevent="removeFromStarred"
      >
        <icon-star />
      </a>
    </div>
    <div class="pt-3">
      <SectionHeader title="Folders" v-if="folders.length" />
      <FoldersList
        :folders="folders"
        @double-click="
          $router.push({ name: 'folders', params: { folderId: $event.id } })
        "
        @select-change="handleSelectChange"
      />

      <SectionHeader title="Files" v-if="files.length" />
      <FilesList :files="files" @select-change="handleSelectChange" />
    </div>
    <app-toast
      :show="toast.show"
      :message="toast.message"
      type="success"
      position="bottom-left"
      @hide="toast.show = false"
    />
  </div>
</template>
<script>
import { reactive, ref, onMounted } from "vue";
import SectionHeader from "../components/files/SectionHeader.vue";
import { starredFiles, starredFolders } from "../api/starred";
import FoldersList from "../components/files/FoldersList.vue";
import FilesList from "../components/files/FilesList.vue";
import { removeFileFromStarred, removeFolderFromStarred } from "../api/starred";

const fetchStarredFoldersAndFiles = async () => {
  try {
    const { data: folders } = await starredFolders();
    const { data: files } = await starredFiles();
    return { folders, files };
  } catch (error) {
    console.error(error);
  }
};

const removeItem = async (item, items, fn) => {
  try {
    const response = await fn(item);
    if (response.status === 200 || response.status === 204) {
      const index = items.value.findIndex((i) => i.id === item.id);
      items.value.splice(index, 1);
    }
  } catch (error) {
    console.error(error);
  }
};

export default {
  components: { SectionHeader, FoldersList, FilesList },
  setup() {
    const toast = reactive({
      show: false,
      message: "",
    });
    const folders = ref([]);
    const files = ref([]);
    const selectedItems = ref([]);

    const handleSelectChange = (items) => {
      selectedItems.value = Array.from(items);
    };

    const removeFromStarred = () => {
      selectedItems.value.forEach((item) => {
        if (item.mimeType) {
          removeItem(item, files, removeFileFromStarred);
        } else {
          removeItem(item, folders, removeFolderFromStarred);
        }
      });
      selectedItems.value.splice(0);
      toast.show = true;
      toast.message = "Selected item(s) removed from starred";
    };

    onMounted(async () => {
      const response = await fetchStarredFoldersAndFiles();
      folders.value = response.folders;
      files.value = response.files;
    });

    return {
      toast,
      folders,
      files,
      selectedItems,
      handleSelectChange,
      removeFromStarred,
    };
  },
};
</script>
