<template>
  <div class="container">
    <ActionBar
      :selected-count="selectedItems.length"
      @remove="handleRemove"
      @rename="modal.rename = true"
      @files-choosen="choosenFiles = $event"
      @create-folder="modal.newFolder = true"
      @starred="addItemsToStarred"
    />

    <teleport to="#search-form">
      <SearchForm v-model="q" />
    </teleport>
    <DropZone
      @files-dropped="choosenFiles = $event"
      :show-message="!files.length && !folders.length"
    >
      <SectionHeader
        title="Folders"
        @sort-change="handleSortChange"
        v-if="folders.length"
        sort-toggler
      />
      <FoldersList
        :folders="folders"
        @double-click="handleDoubleClickFolder"
        @select-change="handleSelectChange($event)"
        :selected="selectedItems"
      />

      <SectionHeader
        title="Files"
        @sort-change="handleSortChange"
        v-if="files.length"
        :sort-toggler="!folders.length"
      />
      <FilesList
        :files="files"
        @select-change="handleSelectChange($event)"
        :selected="selectedItems"
      />
    </DropZone>
    <app-toast
      :show="toast.show"
      :message="toast.message"
      type="success"
      position="bottom-left"
      @hide="toast.show = false"
    />
    <app-modal
      :title="modal.rename ? 'Rename' : 'New Folder'"
      :show="(modal.rename && selectedItems.length === 1) || modal.newFolder"
      @hide="(modal.rename = false), (modal.newFolder = false)"
    >
      <FolderNewForm
        v-if="modal.newFolder"
        @folder-created="handleFolderCreated"
        @close="modal.newFolder = false"
        :folder-id="folderId"
      />
      <RenameForm
        :data="selectedItems[0]"
        @close="modal.rename = false"
        @updated="handleFileUpdated"
        :submit="renameFile"
        v-else-if="modal.rename && isFile"
      />
      <RenameForm
        :data="selectedItems[0]"
        @close="modal.rename = false"
        @updated="handleFolderUpdated"
        :submit="renameFolder"
        v-else
      />
    </app-modal>
    <UploaderPopup
      :files="choosenFiles"
      @upload-complete="handleUploadComplete"
      :folder-id="folderId"
    />
  </div>
</template>

<script>
import filesApi from "../api/files";
import foldersApi from "../api/folders";
import ActionBar from "../components/ActionBar.vue";
import SearchForm from "../components/SearchForm.vue";
import SectionHeader from "../components/files/SectionHeader.vue";
import FilesList from "../components/files/FilesList.vue";
import FoldersList from "../components/files/FoldersList.vue";
import RenameForm from "../components/files/RenameForm.vue";
import FolderNewForm from "../components/files/FolderNewForm.vue";
import DropZone from "../components/uploader/file-chooser/DropZone.vue";
import UploaderPopup from "../components/uploader/popup/UploaderPopup.vue";
import {
  ref,
  reactive,
  watchEffect,
  toRef,
  provide,
  onMounted,
  computed,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { addFileToStarred, addFolderToStarred } from "../api/starred";

const getPath = (folderId) => {
  let folderPath = "folders";
  let filePath = "files";

  if (folderId > 0) {
    const basePath = `folders/${folderId}`;
    folderPath = `${basePath}/${folderPath}`;
    filePath = `${basePath}/${filePath}`;
  }

  return { folderPath, filePath };
};

const fetchFoldersAndFiles = async (folderId, query) => {
  const router = useRouter();
  try {
    const { folderPath, filePath } = getPath(folderId);
    const apiQuery = { ...query, folderId };
    const { data: folders } = await foldersApi.index(apiQuery, folderPath);
    const { data: files } = await filesApi.index(apiQuery, filePath);
    return { folders, files };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      router.push({
        name: "error.404.resource",
        params: { resource: "folder" },
      });
    } else {
      console.error(error);
    }
  }
};

const removeItem = async (item, items, fn) => {
  try {
    const response = await fn(item.id);
    if (response.status === 200 || response.status === 204) {
      const index = items.value.findIndex((i) => i.id === item.id);
      items.value.splice(index, 1);
    }
  } catch (error) {
    console.error(error);
  }
};

const addToStarred = (items) => {
  items.forEach(async (item) => {
    if (item.mimeType) {
      addFileToStarred(item);
    } else {
      addFolderToStarred(item);
    }
  });
};

export default {
  components: {
    ActionBar,
    FilesList,
    FoldersList,
    SectionHeader,
    SearchForm,
    RenameForm,
    FolderNewForm,
    DropZone,
    UploaderPopup,
  },
  setup() {
    const files = ref([]);
    const folders = ref([]);
    const query = reactive({
      _sort: "name",
      _order: "asc",
      q: "",
    });
    const folderId = ref(0);
    const selectedItems = ref([]);
    const toast = reactive({
      show: false,
      message: "",
    });
    const modal = reactive({
      rename: false,
      newFolder: false,
    });
    const choosenFiles = ref([]);
    const route = useRoute();
    const router = useRouter();

    const handleSelectChange = (items) => {
      selectedItems.value = Array.from(items);
    };

    const handleFolderCreated = (folder) => {
      folders.value.push(folder);
      toast.message = `Folder ${folder.name} created`;
      toast.show = true;
    };

    const addItemsToStarred = () => {
      addToStarred(selectedItems.value);
      selectedItems.value.splice(0);
      toast.show = true;
      toast.message = "Selected item(s) added to starred";
    };

    provide("setSelectedItem", handleSelectChange);

    const handleSortChange = (payload) => {
      query._sort = payload.column;
      query._order = payload.order;
    };

    const handleRemove = () => {
      if (confirm("Are you sure?")) {
        selectedItems.value.forEach((item) => {
          if (item.mimeType) {
            removeItem(item, files, filesApi.delete);
          } else {
            removeItem(item, folders, foldersApi.delete);
          }
        });
        selectedItems.value.splice(0);
        toast.show = true;
        toast.message = "Selected item(s) successfully removed";
      }
    };

    const handleRename = (items, newItem, entity) => {
      const oldItem = selectedItems.value[0];
      const index = items.value.findIndex((item) => item.id === newItem.id);
      items.value.splice(index, 1, newItem);
      toast.show = true;
      toast.message = `${entity} '${oldItem.name}' renamed to '${newItem.name}'`;
    };

    const handleFileUpdated = (file) => {
      handleRename(files, file, "File");
    };

    const handleFolderUpdated = (folder) => {
      handleRename(folders, folder, "Folder");
    };

    const handleUploadComplete = (item) => {
      files.value.push(item);
    };

    const handleDoubleClickFolder = (folder) => {
      // query.folderId = folder.id;
      router.push({ name: "folders", params: { folderId: folder.id } });
    };

    watchEffect(async () => {
      folderId.value = route.params.folderId || 0;
      const response = await fetchFoldersAndFiles(folderId.value, query);
      files.value = response.files;
      folders.value = response.folders;
    });

    watch(query, (newQuery) => {
      router.push({
        name: route.name,
        query: newQuery,
      });
    });

    const isFile = computed(
      () => selectedItems.value.length === 1 && selectedItems.value[0].mimeType
    );

    return {
      files,
      folders,
      handleSortChange,
      q: toRef(query, "q"),
      folderId,
      handleSelectChange,
      addItemsToStarred,
      selectedItems,
      handleRemove,
      toast,
      modal,
      handleFileUpdated,
      handleFolderUpdated,
      handleFolderCreated,
      choosenFiles,
      handleUploadComplete,
      handleDoubleClickFolder,
      renameFile: filesApi.update,
      renameFolder: foldersApi.update,
      isFile,
    };
  },
};
</script>
