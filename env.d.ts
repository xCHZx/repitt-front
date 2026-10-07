import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    action?: string
    subject?: string
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw
    layout?: 'blank' | 'default' | 'company' | 'visitor'

    /** No session required. */
    public?: boolean

    /** Public page that signed-in users should not see (login, register): redirect home. */
    guestOnly?: boolean

    /** `business` = /empresa area: needs a membership (owner or cashier). */
    area?: 'business' | 'visitor'

    /** Business area page that works without an active business (selector, create business). */
    needsBusiness?: boolean

    /** Hidden from cashiers (§3.4). */
    ownerOnly?: boolean

    /** Counter screen: blocked when the active business entitlement is not allowed (§3.2). */
    requiresEntitlement?: boolean
  }
}
