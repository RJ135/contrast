/**
 * Hestion ADMIN BRO
 */
const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
const mongoose = require('mongoose')

AdminBro.registerAdapter(AdminBroMongoose)

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: '/admin',
  branding: {
      logo:'https://img.icons8.com/wired/2x/admin-settings-male.png',
      companyName: 'CONTRAST',
  }
})

const ADMIN ={
    email: process.env.ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD || 'admin',
}

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro,{
    cookieName: process.env.ADMIN_COOKIE_NAME || 'admin-bro',
    cookiePassword: process.env.ADMIN_COOKIE_PASS || 'nimda-orb',
    authenticate: (email,password) =>{
        if (email == ADMIN.email && password === ADMIN.password) {
            return ADMIN
        }
        return null
    }
})

module.exports = router