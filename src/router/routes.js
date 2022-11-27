import MyFiles from "../pages/MyFiles.vue";
import Recent from "../pages/Recent.vue";
import Starred from "../pages/Starred.vue";
import Drive from "../pages/Drive.vue";
import RouteNotFound from "../pages/errors/RouteNotFound.vue";
import ResourceNotFound from "../pages/errors/ResourceNotFound.vue";

const routes = [
  {
    path: "/drive",
    component: Drive,
    children: [
      {
        path: "",
        redirect: { name: "my-files" },
      },
      {
        path: "my-files",
        component: MyFiles,
        name: "my-files",
      },
      {
        path: "recent",
        component: Recent,
        name: "recent",
      },
      {
        path: "starred",
        component: Starred,
        name: "starred",
        alias: ["favorites", "/favorites"],
      },
      {
        path: "folders/:folderId",
        name: "folders",
        component: MyFiles,
      },
    ],
  },
  {
    path: "/:notFound(.*)",
    name: "error.404.route",
    component: RouteNotFound,
  },
  {
    path: "/404/:resource",
    name: "error.404.resource",
    component: ResourceNotFound,
    props: true,
  },
];

export default routes;
