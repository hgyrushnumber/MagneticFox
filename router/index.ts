import type { RouteRecordRaw } from "vue-router"
import { routerConfig } from "@/router/config"
import { registerNavigationGuard } from "@/router/guard"
import { createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"

const Layouts = () => import("@/layouts/index.vue")

/**
 * @name 常驻路由
 * @description 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置唯一的 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboardnew",
          affix: true
        }
      }
    ]
  },
  {
    path: "/bindOzon",
    component: Layouts,
    redirect: "/bindOzon/addstore",
    name: "Ozon店铺管理",
    meta: {
      title: "Ozon店铺管理", // 主菜单标题
      // svgIcon: "unocss", // 主菜单图标
      keepAlive: true
    },
    children: [
      // {
      //   path: "addStore",
      //   component: () => import("@/views/binding-ozon/add-store/index.vue"),
      //   name: "AddOzonStore",
      //   meta: {
      //     title: "添加Ozon商铺",
      //     svgIcon: "smile" // 可选：替换成更具体的图标
      //   }
      // },
      {
        path: "addStore",
        component: () => import("@/pages/add_store/index.vue"),
        name: "addStore",
        meta: {
          title: "添加的Ozon店铺",
          svgIcon: "addStore", // 可选：替换成更具体的图标
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/product",
    component: Layouts,
    redirect: "/product/submitproduct",
    name: "ozon商品管理",
    meta: {
      title: "ozon商品管理", // 主菜单标题
      // svgIcon: "unocss", // 主菜单图标
      keepAlive: true
    },
    children: [
      {
        path: "submitproduct",
        component: () => import("@/pages/submit_product_frontend/index.vue"),
        name: "submitProduct",
        meta: {
          title: "通过前端提交商品",
          svgIcon: "submitproject", // 可选：替换成更具体的图标
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/table",
    component: Layouts,
    redirect: "/table/generateTable",
    name: "生成表格",
    meta: {
      title: "生成表格", // 主菜单标题
      // svgIcon: "unocss", // 主菜单图标
      keepAlive: true
    },
    children: [
      {
        path: "generateTable",
        component: () => import("@/pages/submit_product_table/index.vue"),
        name: "generateTable",
        meta: {
          title: "生成表格",
          svgIcon: "generate_table", // 可选：替换成更具体的图标
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/calculate",
    component: Layouts,
    redirect: "/calculate/profitability",
    name: "计算商品利润率",
    meta: {
      title: "计算商品利润率", // 主菜单标题
      // svgIcon: "unocss", // 主菜单图标
      keepAlive: true
    },
    children: [
      {
        path: "profitability",
        component: () => import("@/pages/calculate_value/index.vue"),
        name: "profitability",
        meta: {
          title: "计算商品利润率",
          svgIcon: "calculate", // 可选：替换成更具体的图标
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/get",
    component: Layouts,
    redirect: "/get/keyword",
    name: "关键词",
    meta: {
      title: "关键词", // 主菜单标题
      // svgIcon: "unocss", // 主菜单图标
      svgIcon: "keyword", // 可选：替换成更具体的图标
      keepAlive: true
    },
    children: [
      {
        path: "keyword",
        component: () => import("@/pages/get_keyword/index.vue"),
        name: "keyword",
        meta: {
          title: "获得关键词",
          svgIcon: "keyword", // 可选：替换成更具体的图标
          keepAlive: true
        }
      },
      {
        path: "frontEndkeyword",
        component: () => import("@/pages/get_keyword_byFrontEnd/index.vue"),
        name: "frontEndkeyword",
        meta: {
          title: "通过前端获得关键词",
          svgIcon: "keyword", // 可选：替换成更具体的图标
          keepAlive: true
        }
      }
    ]
  }
]

/**
 * @name 动态路由
 * @description 用来放置有权限 (Roles 属性) 的路由
 * @description 必须带有唯一的 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/permission",
    component: Layouts,
    redirect: "/permission/manageUser",
    name: "Permission",
    meta: {
      title: "管理用户",
      svgIcon: "vip",
      // 可以在根路由中设置角色
      roles: ["admin"],
      alwaysShow: true
    },
    children: [
      {
        path: "manageUser",
        component: () => import("@/pages/admin/manageUser/index.vue"),
        name: "管理用户",
        meta: {
          title: "admin",
          // 或者在子路由中设置角色
          svgIcon: "vip",
          roles: ["admin"]
        }
      }
      // {
      //   path: "page-level",
      //   component: () => import("@/pages/demo/permission/page-level.vue"),
      //   name: "PermissionPageLevel",
      //   meta: {
      //     title: "页面级",
      //     // 或者在子路由中设置角色
      //     roles: ["admin"]
      //   }
      // },
      // {
      //   path: "button-level",
      //   component: () => import("@/pages/demo/permission/button-level.vue"),
      //   name: "PermissionButtonLevel",
      //   meta: {
      //     title: "按钮级",
      //     // 如果未设置角色，则表示：该页面不需要权限，但会继承根路由的角色
      //     roles: undefined
      //   }
      // }
    ]
  }
]

/** 路由实例 */
export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  try {
    // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    location.reload()
  }
}

// 注册路由导航守卫
registerNavigationGuard(router)
