import {createRouter, createWebHashHistory} from 'vue-router'
import HomeView from '../components/HelloWorld.vue'
import EmployeeListView from '../views/EmployeeList.vue'
import UserLogin from '../views/UserLogin.vue'


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login',
            meta: {
                title: '人事管理系统 - 登录'
            }
        },
        {
            path: '/employees',
            name: 'employees',
            component: EmployeeListView,
            meta:{requireAuth: true}
        },
        {
            path: '/login',
            name: 'login',
            component: UserLogin,
            meta: {
                title: '人事管理系统 - 登录'
            }
        },
        {
            path:'/helloWorld',
            name: 'helloWorld',
            component: HomeView,
            title: '人事管理系统主页'
        }

    ]
});

// 添加路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // 如果目标路由需要认证且本地没有 token，则认为未登录
    if (to.meta.requiresAuth && !token) {
        next('/login') // 重定向到登录页
        document.title = to.meta.title
    } else if (to.path === '/login' && token) {
        next('/helloWorld') // 如果已登录又访问登录页，重定向到管理界面
    } else {
        document.title = '人事管理系统'
        next() // 正常放行
    }
})

export default router
